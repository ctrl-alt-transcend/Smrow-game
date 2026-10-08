import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;


  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.toLowerCase(): value) as string)
  readonly email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
