import {
  Controller,
  Body,
  Post,
  UseGuards,
  Query,
  Get,
  Req,
  Request,
  Put,
} from '@nestjs/common';
import { UserCreateDto } from './dto/user-create.dto';
import { AuthService } from './auth.service';
import { UpdateProfileDto } from './dto/user-update.dto';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() data: { email: string; password: string }) {
    return this.authService.login(data.email, data.password);
  }

  @Post('register')
  async register(@Body() body: UserCreateDto): Promise<any> {
    const user = await this.authService.register(body);
    return {
      status: 'success',
      message: 'User registered successfully.',
      data: user,
    };
  }

  @Post('logout')
  async logout(@Body() body: { token: string }) {
    return this.authService.logout(body.token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body('email') email: string) {
    return this.authService.sendNewPasswordEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('active-user')
  async sendActivationEmail(@Body() body: { email: string }) {
    return this.authService.sendActivationEmail(body.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('activate')
  async activateUser(
    @Query('email') email: string,
    @Query('token') token: string,
  ) {
    return this.authService.activateUserByEmail(email, token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Body('token') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      message: 'Protected route, user authenticated',
      user: req.user,
    };
  }
  @Put('update-profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() data: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, data);
  }
}
