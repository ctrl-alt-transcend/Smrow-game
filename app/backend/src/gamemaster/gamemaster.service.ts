import { Injectable } from '@nestjs/common';
import { CreateGamemasterDto } from './dto/create-gamemaster.dto';
import { UpdateGamemasterDto } from './dto/update-gamemaster.dto';

@Injectable()
export class GamemasterService {
  create(createGamemasterDto: CreateGamemasterDto) {
    return 'This action adds a new gamemaster';
  }

  greetingsFromGM(): string {
    return 'Hello, I am the Game Master';
  }

  itsYourTurn() {
    return 'Now it is your turn';
  }

  findAll() {
    return `This action returns all gamemaster`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gamemaster`;
  }

  //update(id: number, updateGamemasterDto: UpdateGamemasterDto) {
  //  return `This action updates a #${id} gamemaster`;
  //}

  remove(id: number) {
    return `This action removes a #${id} gamemaster`;
  }
}
