import { Controller, Body, Post } from '@nestjs/common';
import { AuthService} from './auth.service';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<unknown> {
    return this.AuthService.signUpRes(createUserDto);
  }

  @Post('login')
  async login(@Body() authUserDto: AuthUserDto): Promise<unknown {
    return this.AuthService.signIn(authUserDto.email, authUserDto.password);
  }
}
