import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { UserCreateDto } from './dto/user-create.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

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

  //   login = async (data: { email: string; password: string }): Promise<any> => {
  //     const user = await this.prismaService.user.findUnique({
  //       where: { email: data.email },
  //     });
  //     if (!user) {
  //       throw new HttpException(
  //         {
  //           status: 'error',
  //           message: 'Invalid email or password.',
  //         },
  //         HttpStatus.UNAUTHORIZED,
  //       );
  //     }
  //     const isPasswordValid = await compare(data.password, user.password);
  //     if (!isPasswordValid) {
  //       throw new HttpException(
  //         {
  //           status: 'error',
  //           message: 'Invalid email or password.',
  //         },
  //         HttpStatus.UNAUTHORIZED,
  //       );
  //     }
  //     const payload = {
  //       id: user.id,
  //       fullName: user.fullName,
  //       email: user.email,
  //       role: user.role,
  //     };
  //     const accessToken = await this.jwtService.signAsync(payload, {
  //       secret: process.env.ACCESS_TOKEN_KEY,
  //       expiresIn: '1h',
  //     });

  //     const refreshToken = await this.jwtService.signAsync(payload, {
  //       secret: process.env.REFRESH_TOKEN_KEY,
  //       expiresIn: '7d',
  //     });

  //     return {
  //       status: 'success',
  //       message: 'Login successful.',
  //       data: {
  //         user: {
  //           id: user.id,
  //           email: user.email,
  //           fullName: user.fullName,
  //           role: user.role,
  //         },
  //         accessToken,
  //         refreshToken,
  //       },
  //     };
  //   };
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
}
