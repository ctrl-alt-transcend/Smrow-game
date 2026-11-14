import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Default googleStrategy guard configuration
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
