import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bycrypt from 'bcrypt';
import { UserPublic, CreatePostResponse } from '../../shared/types';


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly JwtService: JwtService
  ) {}

  async signUpRes(createUserDto: CreateUserDto): Promise<{message: string, user: UserPublic, access_token: String}> {
    createUserDto.password = await this.hashPassword(createUserDto.password);
    const user = await this.userService.create(createUserDto);
    const token: { access_token: string } = await this.createJWTToken({
      id: user.id,
      username: String(user.username)
    });

    const UserPublic: UserPublic = {
      id: Number(user.id),
      name: user.name,
      email: user.email
    };

    return {
      message: 'User created successfully',
      user: UserPublic,
      access_token: token.access_token
    };
  }

  //async signUp(createUserDto: CreateUserDto): Promise<{access_token: string}> {
  //  createUserDto.password = await this.hashPassword(createUserDto.password);
  //  const user = await this.userService.create(createUserDto);
  //  return await this.createJWTToken(user);
  //}

  async signIn(email: string, password: string): Promise<{access_token: string}> {
    const user = await this.userService.findByMail(email);
    if (user == null || user.localAuth == null || !(await bycrypt.compare(password, user.localAuth.passwordHash)))
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
  private async createJWTToken(user: {id: string, username: string}): Promise<{access_token: string}> {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.JwtService.signAsync(payload),
    };
  }
}
