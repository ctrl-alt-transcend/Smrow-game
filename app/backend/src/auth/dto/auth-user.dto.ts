import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class AuthUserDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => typeof value === 'string' ? value.toLowerCase(): value)
  readonly email: string;

  @IsString()
  @MinLength(8)
  readonly password: string;
}
