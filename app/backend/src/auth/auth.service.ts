import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bycrypt from 'bcrypt';
import type { UserPublic, RegisterResponse } from '../../shared/types';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly JwtService: JwtService,
  ) {}

  async signUp(recvData: CreateUserDto): Promise<RegisterResponse> {
    recvData.password = await this.hashPassword(recvData.password);
    const user = await this.userService.create(recvData);

    const { access_token } = await this.createJWTToken({
      id: user.id,
      username: String(user.username),
    });

    const userPublic: UserPublic = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const result: RegisterResponse = {
      message: 'User created successfully',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user: userPublic,
      access_token: access_token,
    };
    return result;
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findByMail(email);
    if (
      user == null ||
      user.localAuth == null ||
      !(await bycrypt.compare(password, user.localAuth.passwordHash))
    )
      throw new UnauthorizedException('Invalid credentials');

    return await this.createJWTToken(user);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bycrypt.genSalt(10);
    const hash = await bycrypt.hash(password, salt);

    return hash;
  }

  /*
   * @brief:   Create a JWT token for the given user
   * @details: the payload is the visible part of the token, it contains the userId and username
   */
  private async createJWTToken(user: {
    id: string;
    username: string;
  }): Promise<{ access_token: string }> {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.JwtService.signAsync(payload),
    };
  }
}
