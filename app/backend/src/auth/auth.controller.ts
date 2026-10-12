import { Controller, Body, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService} from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.AuthService.signUpRes(createUserDto);
  }

  //WARN: no validation pipe
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) : Promise<{access_token: string}> {
    return this.AuthService.signIn(req.user);
  }
}
