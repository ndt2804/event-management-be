// auth/dto/update-profile.dto.ts
import { IsOptional, IsString, IsEmail, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string; // Cần xác thực email mới

  @IsOptional()
  @MinLength(6)
  password?: string; // Nếu cập nhật password thì cần nhập mật khẩu cũ

  @IsOptional()
  @MinLength(6)
  oldPassword?: string; // Bắt buộc nếu cập nhật password
}
