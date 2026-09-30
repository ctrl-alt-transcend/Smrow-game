import { Controller, Body, Post } from '@nestjs/common';
import { UserService} from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly UserService: UserService) {}

  @Post('register')
  async create(@Body() CreateUserDto: CreateUserDto) {
    return this.UserService.create(CreateUserDto);
  }
}
