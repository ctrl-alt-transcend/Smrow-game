import { IsOptional, IsInt } from 'class-validator';

export class RollDiceDto {
  @IsOptional()
  @IsInt()
  sessionId?: string;
}