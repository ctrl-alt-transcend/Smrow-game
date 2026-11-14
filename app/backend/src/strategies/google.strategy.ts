import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import type { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';

/**
 * validates the response from googleOauth takes the response message with the profile and uses
 * the validate function to create the user and create it if necessary.
 * @returns the created user by authservice
 */

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private authservice: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clientId,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshtoken: string, profile: Profile) {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new UnauthorizedException('Google account has no email.');
    }

    const emailVerified = profile._json.email_verified === true;

    console.log({ profile });
    const user = await this.authservice.validateGoogleUser({
      googleId: profile.id,
      email,
      emailVerified,
      name: profile.displayName,
    });
    return user;
  }
}
