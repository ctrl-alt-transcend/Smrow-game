import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bycrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly UserService: UserService) {}

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.UserService.findByMail(email);
    if (user == null || !(await bycrypt.compare(password, user.password)))
      throw new UnauthorizedException('Invalid credentials');

    //TODO: implement JWT token generation and return it instead of the user object
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bycrypt.genSalt(10);
    const hash = await bycrypt.hash(password, salt);

    return hash;
  }
}
