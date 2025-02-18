import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { User } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { UserCreateDto } from './dto/user-create.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { UpdateProfileDto } from './dto/user-update.dto';
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailService,
  ) { }
  async sendActivationEmail(email: string): Promise<string> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Nếu người dùng đã kích hoạt tài khoản, không gửi lại email
    if (user.isActive) {
      return 'User is already active';
    }

    // Tạo activation token, thời gian sống là 1 giờ
    const activationToken = this.jwtService.sign(
      { email: user.email },
      { secret: process.env.ACTIVE_KEY, expiresIn: '3h' },
    );

    // Tạo link kích hoạt
    const activationLink = `http://localhost:3000/api/auth/activate?email=${encodeURIComponent(
      user.email,
    )}&token=${activationToken}`;

    // Gửi email kích hoạt
    await this.mailerService.sendActivationEmail(user.email, activationLink);

    return 'Activation email sent successfully';
  }

  async activateUserByEmail(email: string, token: string): Promise<string> {
    try {
      // Giải mã token để lấy email
      const decoded = this.jwtService.verify(token, {
        secret: process.env.ACTIVE_KEY,
      });

      if (decoded.email !== email) {
        throw new Error('Invalid token');
      }

      // Kiểm tra người dùng có tồn tại không
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Cập nhật trạng thái isActive thành true
      if (user.isActive) {
        return 'User is already active';
      }

      await this.prismaService.user.update({
        where: { email },
        data: { isActive: true },
      });

      return 'User account activated successfully';
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user || !(await compare(password, user.password))) {
      return null; // Nếu không tìm thấy người dùng hoặc mật khẩu không hợp lệ
    }

    const { password: _, ...result } = user;
    return result; // Trả về thông tin người dùng mà không có password
  }
  async validateJwtUser(payload: JwtPayload): Promise<any> {
    // Bạn có thể tìm người dùng bằng email hoặc id, tùy thuộc vào dữ liệu trong payload
    const user = await this.prismaService.user.findUnique({
      where: {
        email: payload.email, // Tìm người dùng dựa trên email trong payload
      },
    });

    if (!user) {
      return null; // Nếu không tìm thấy người dùng
    }

    return user;
  }
  async generateTokens(id: string, email: string, role: string) {
    if (!id) {
      throw new Error('User ID is required');
    }
    const payload: JwtPayload = { id, email, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: '7d',
    });
    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId: id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });
    const storedToken = await this.prismaService.refreshToken.findFirst({
      where: { token },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const newAccessToken = this.jwtService.sign(
      { id: payload.id, email: payload.email, role: payload.role },
      { secret: process.env.ACCESS_TOKEN_KEY, expiresIn: '1h' },
    );

    return { accessToken: newAccessToken };
  }


  // auth.service.ts

  async logout(token: string) {
    // Tìm refreshToken theo token
    const refreshToken = await this.prismaService.refreshToken.findFirst({
      where: { token },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Xóa refreshToken khỏi cơ sở dữ liệu
    await this.prismaService.refreshToken.deleteMany({ where: { token } });

    return { message: 'Logged out successfully' };
  }


  register = async (userData: UserCreateDto,): Promise<Omit<User, 'password'>> => {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: userData.email,
      },
    });
    if (user) {
      throw new HttpException(
        { message: 'This email is already registered.' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashedPassword = await hash(userData.password, 10);
    const newUser = await this.prismaService.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
      },
    });
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  };

  async login(email: string, password: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user || !(await compare(password, user.password))) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }


    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);

    return {
      status: 'success',
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    };
  }


  // auth.service.ts
  async updateProfile(userId: string, data: UpdateProfileDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.prismaService.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
      }
    }

    if (data.password && data.oldPassword) {
      const passwordValid = await compare(
        data.oldPassword,
        existingUser.password,
      );
      if (!passwordValid) {
        throw new HttpException(
          'Incorrect old password',
          HttpStatus.BAD_REQUEST,
        );
      }
      data.password = await hash(data.password, 10);
    } else if (data.password && !data.oldPassword) {
      throw new HttpException(
        'Old password is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        email: data.email,
        password: data.password ? data.password : undefined,
      },
    });

    return { message: 'Profile updated successfully', user: updatedUser };
  }

}
