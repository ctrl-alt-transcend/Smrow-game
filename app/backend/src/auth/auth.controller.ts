import { Controller, Body, Post, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Req } from '@nestjs/common';
import { type UserPublic } from 'shared';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  RegisterResponseDto,
  UserProfileDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResponseDto)
  async register(@Body() body: RegisterDto) {
    return this.AuthService.signUp(body);
  }

  @Post('login')
  @ZodSerializerDto(LoginResponseDto)
  async login(@Body() body: LoginDto) {
    return this.AuthService.signIn(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ZodSerializerDto(UserProfileDto)
  async me(@Req() req: { user: UserPublic }) {
    return this.AuthService.getProfile(req.user.id);
  }
}
