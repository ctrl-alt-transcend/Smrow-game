import {
  Controller,
  Body,
  Post,
  Get,
  UseGuards,
  Patch,
  Logger,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  type UserProfile,
  type LoginResponse,
  type RegisterResponse,
  UserPublic,
} from 'shared';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  RegisterResponseDto,
  UpdateProfileDto,
  UserProfileDto,
} from './dto/auth.dto';
import { GoogleAuthGuard } from '../guards/google-auth/google-auth.guard';
import type { Response } from 'express';
import { setAuthCookie, clearAuthCookie } from './auth.cookies';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly AuthService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResponseDto)
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponse> {
    const result = this.AuthService.signUp(body);
    setAuthCookie(res, (await result).access_token);
    return result;
  }

  @Post('login')
  @ZodSerializerDto(LoginResponseDto)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const access_token = await this.AuthService.signIn(body);
    setAuthCookie(res, access_token);
    return { message: 'Successfully logged in!' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ZodSerializerDto(UserProfileDto)
  async me(@Req() req: { user: UserPublic }) {
    return this.AuthService.getProfile(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ZodSerializerDto(UserProfileDto)
  async updateMe(
    @Req() req: { user: UserPublic },
    @Body() body: UpdateProfileDto,
  ) {
    return this.AuthService.updateProfile(req.user.id, body);
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
    const access_token = await this.AuthService.createJWTToken(req.user);

    const isProd = process.env.NODE_ENV === 'production';

    this.logger.debug(`NODE_ENV: ${process.env.NODE_ENV}`);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: isProd, // for dev
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const redir = isProd ? '/' : 'http://localhost:5173';

    return res.redirect(redir);
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
    this.logger.log('Logout request received');
    // const isProd = process.env.NODE_ENV === 'production';
    clearAuthCookie(res);
    return { message: 'User logged out successfully' };
  }
}
