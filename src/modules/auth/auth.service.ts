import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
  ) {}

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

  register = async (
    userData: UserCreateDto,
  ): Promise<Omit<User, 'password'>> => {
    // Kiểm tra xem email đã tồn tại chưa
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
  async login(user: any) {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Tạo access token (JWT token cho phiên làm việc)
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: '1h',
    });

    // Tạo refresh token (JWT token dài hạn)
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: '7d',
    });

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
