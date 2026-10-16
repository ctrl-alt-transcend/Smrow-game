import { PartialType } from '@nestjs/mapped-types';
import { CreateGamemasterDto } from './create-gamemaster.dto';

export class UpdateGamemasterDto extends PartialType(CreateGamemasterDto) {}
