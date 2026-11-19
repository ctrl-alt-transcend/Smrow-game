import { createZodDto } from 'nestjs-zod';
import {
  RegisterPostSchema,
  LoginPostSchema,
  RegisterResponseSchema,
  LoginResponseSchema,
  UserProfileSchema,
} from 'shared';

export class RegisterDto extends createZodDto(RegisterPostSchema) {}
export class LoginDto extends createZodDto(LoginPostSchema) {}
export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}
export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}
export class UserProfileDto extends createZodDto(UserProfileSchema) {}
export class UpdateProfileDto extends createZodDto(
  UserProfileSchema.omit({ id: true, createdAt: true }).partial(),
) {}
