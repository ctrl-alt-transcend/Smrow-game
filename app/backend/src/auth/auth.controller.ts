import { Controller, Body, Post, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Req } from '@nestjs/common';
import type { UserPublic } from '../../shared/types';


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
}
