import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_KEY,
    });
  }

  async validate(payload: JwtPayload) {
    // Kiểm tra xem user có tồn tại không, có thể thêm logic phân quyền ở đây
    const user = await this.authService.validateJwtUser(payload);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
