import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '@prisma/client';
import * as bycrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly JwtService: JwtService
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<{access_token: string}> {
    createUserDto.password = await this.hashPassword(createUserDto.password);
    const user = await this.userService.create(createUserDto);
  
    return await this.createJWTToken(user);
  }

  async signIn(email: string, password: string): Promise<{access_token: string}> {
    const user = await this.userService.findByMail(email);
    if (user == null || !(await bycrypt.compare(password, user.password)))
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
  private async createJWTToken(user: User): Promise<{access_token: string}> {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.JwtService.signAsync(payload),
    };
  }
}

