import { Controller, Body, Post, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Req, Res } from '@nestjs/common';
import type { UserProfile, UserPublic } from '@shared/types';
import { GoogleAuthGuard } from 'src/guards/google-auth/google-auth.guard';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<unknown> {
    return this.AuthService.signUp(createUserDto);
  }

  @Post('login')
  async login(@Body() authUserDto: AuthUserDto): Promise<unknown> {
    return this.AuthService.signIn(authUserDto.email, authUserDto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: { user: UserPublic }): Promise<unknown> {
    return this.AuthService.getProfile(req.user.id);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Req() req: { user: UserProfile },
    @Res() res: Response,
  ) {
    const response = await this.AuthService.createJWTToken(req.user);

    return res.redirect(`http://localhost:5173?token=${response.access_token}`);
  }
}
