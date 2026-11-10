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
  googleLogin() {
    console.log('starting google login');
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Req() req: { user: UserProfile },
    @Res() res: Response,
  ) {
    const response = await this.AuthService.createJWTToken(req.user);

    res.cookie('access_token', response.access_token, {
      httpOnly: true,
      secure: false, // for dev
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect('http://localhost:5173');
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    console.log('Logout request received');
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: false, // for dev,
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'User logged out successfully' };
  }
}
