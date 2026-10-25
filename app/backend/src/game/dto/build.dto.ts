import { IsOptional, IsInt } from 'class-validator';

export class BuildDto {
  @IsOptional()
  @IsInt()
  sessionId?: string;
}