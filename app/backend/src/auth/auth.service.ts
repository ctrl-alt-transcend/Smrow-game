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
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly JwtService: JwtService,
    private readonly databaseService: DatabaseService,
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

  /**
   * @brief :   Create a JWT token for the given user
   * @details : the payload is the visible part of the token, it contains the userId and username
   */
  async createJWTToken(
    user: Pick<UserPublic, 'id' | 'username'>,
  ): Promise<JwtToken> {
    const payload: JwtPayload = { sub: user.id, username: user.username };
    const access_token: string = await this.JwtService.signAsync(payload);
    return JwtTokenSchema.parse(access_token);
  }

  /**
   * @brief  Service used by the google Strategy, will validate, if the user exists in the db and create it if not
   * If the user info returned by google OAuth
   * is or not registered in the platform and it will create a new user if not.
   * If the user has already a local account with the same email, it will create a google-account
   * and link both profiles
   * @param googleUser as data we will receive from the strategy.
   * @returns the user information
   */
  async validateGoogleUser(googleUser: {
    googleId: string;
    email: string;
    name: string;
    emailVerified: boolean;
  }) {
    {
      const account = await this.databaseService.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: googleUser.googleId,
          },
        },
        include: {
          user: true,
        },
      });

      // check google register exists

      if (account) {
        return account.user;
      }

      const existingUser = await this.databaseService.user.findUnique({
        where: {
          email: googleUser.email,
        },
      });

      // check if user mail was already registered and link to google account
      if (existingUser) {
        await this.databaseService.account.create({
          data: {
            provider: 'google',
            providerAccountId: googleUser.googleId,
            userId: existingUser.id,
          },
        });
        return existingUser;
      }

      // when no registers exist, create the account and user with an Interactive Transaction
      // this executes the user and account creation safely, if one fails it rolls back all.
      // $transaction( async (tx) => {...} )

      await this.databaseService.$transaction(async (tx) => {
        const user = tx.user.create({
          data: {
            email: googleUser.email,
            username: `google_${googleUser.googleId}`,
            name: googleUser.name,
          },
        });

        await tx.account.create({
          data: {
            provider: 'google',
            providerAccountId: googleUser.googleId,
            userId: (await user).id,
          },
        });

        return user;
      });
    }
  }
}
