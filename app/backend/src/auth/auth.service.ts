import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bycrypt from 'bcrypt';
import {
  type UserPublic,
  type LoginPost,
  type RegisterResponse,
  type RegisterPost,
  type JwtToken,
  type JwtPayload,
  JwtTokenSchema,
  RegisterResponseSchema,
  type UserProfile,
  UserPublicSchema,
  UserProfileSchema,
  Password,
  PasswordSchema,
  LoginResponse,
} from 'shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly JwtService: JwtService,
  ) {}

  async signUp(recvData: RegisterPost): Promise<RegisterResponse> {
    const passwdHash: string = await this.hashPassword(recvData.password);
    const user: UserPublic = await this.userService.create({
      ...recvData,
      password: passwdHash,
    });

    const access_token: JwtToken = await this.createJWTToken({
      id: user.id,
      username: user.username,
    });

    return RegisterResponseSchema.parse({
      message: 'User created successfully',
      user: UserPublicSchema.parse(user),
      access_token: JwtTokenSchema.parse(access_token),
    });
  }

  async signIn(recvData: LoginPost): Promise<LoginResponse> {
    const user = await this.userService.findByMail(recvData.email);
    if (
      user == null ||
      user.localAuth == null ||
      !(await bycrypt.compare(recvData.password, user.localAuth.passwordHash))
    )
      throw new UnauthorizedException('Invalid credentials');

    const access_token: JwtToken = await this.createJWTToken({
      id: user.id,
      username: user.username,
    });

    return { access_token };
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return UserProfileSchema.parse(user);
  }

  private async hashPassword(password: string): Promise<Password> {
    const salt = await bycrypt.genSalt(10);
    const hash = await bycrypt.hash(password, salt);

    return PasswordSchema.parse(hash);
  }

  /*
   * @brief:   Create a JWT token for the given user
   * @details: the payload is the visible part of the token, it contains the userId and username
   */
  private async createJWTToken(
    user: Pick<UserPublic, 'id' | 'username'>,
  ): Promise<JwtToken> {
    const payload: JwtPayload = { sub: user.id, username: user.username };
    const access_token: string = await this.JwtService.signAsync(payload);
    return JwtTokenSchema.parse(access_token);
  }
}
