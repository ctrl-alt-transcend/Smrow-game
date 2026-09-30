import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly UserService: UserService) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.UserService.findByMail(email);
    if (user?.password !== pass) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password, ...result } = user;

    return result;
  }
}
