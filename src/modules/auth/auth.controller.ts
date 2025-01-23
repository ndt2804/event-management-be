import { Controller, Body, Post, Get } from '@nestjs/common';
import { UserCreateDto } from './dto/user-create.dto';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: UserCreateDto): Promise<User> {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: UserLoginDto): Promise<any> {
    return this.authService.login(body);
  }
}
