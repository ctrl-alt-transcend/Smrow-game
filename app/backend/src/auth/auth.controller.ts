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

  /**
   * will Use GoogleAuthguard to send the request to the google login page. And return the profile data.
   *
   */
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  /**
   *
   * @param req recieves the response from the google login auth, in the respose of the googleValidator
   * @param res Is the response object that we are going to manipulate before sendind it to the front
   * @returns Sends back a cookie with the access token inside that JWT created in the back
   */
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

  /**
   *
   * This route handler will be used to **delete the cookie** set by the google/login, allowing the user to logout from the app.
   * Clearing a cookie is not possible from the React frontend, __HttOnly does not allow the front to modify it__, for this reason we
   * need to call the back api, inform that
   * we want to logout, prompting the deletion of said cookie.
   *
   * @returns: An empty cookie that replaces the previous one, efectively clearing it. And a confirmation message.
   */
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
