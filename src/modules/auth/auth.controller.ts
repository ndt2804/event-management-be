import {
  Controller,
  Body,
  Post,
  UseGuards,
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
  constructor(private authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() data: { email: string; password: string }) {
    return this.authService.login(data);
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
