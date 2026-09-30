import { Controller, Body, Post } from '@nestjs/common';
import { AuthService} from './auth.service';
import { UserService } from '../user/user.service';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService, private readonly UserService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    createUserDto.password = await this.AuthService.hashPassword(createUserDto.password);
    return this.UserService.create(createUserDto);
  }

  @Post('login')
  async login(@Body() authUserDto: AuthUserDto) {
    return this.AuthService.signIn(authUserDto.email, authUserDto.password);
  }
}
