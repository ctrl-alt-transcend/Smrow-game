import { Injectable } from '@nestjs/common';
import type { GameLoopData } from '../game.types'
//import { CreateGamemasterDto } from './dto/create-gamemaster.dto';
//import { UpdateGamemasterDto } from './dto/update-gamemaster.dto';

@Injectable()
export class GamemasterService {
  //create(createGamemasterDto: CreateGamemasterDto) {
  //  return 'This action adds a new gamemaster';
  //}

  private loopData: GameLoopData = {
    firstRoll: 0,
    secondRoll: 0,
    roadsBuilt: 0,
    settlementsBuilt: 0
  }

  greetingsFromGM(): string {
    return 'Hello, I am the Game Master ...';
  }

  yourTurn(): string {
    return 'Now it is your turn !';
  }

  rolledDice(): string {
    if(this.loopData.firstRoll == 0) {
      this.loopData.firstRoll = 1;
      return `You rolled a dice a ${this.loopData.firstRoll}`;
    }
    if(this.loopData.secondRoll == 0) {
      this.loopData.secondRoll = 1;
      return `You rolled a dice a ${this.loopData.secondRoll}`;
    }
    return 'You rolled a dice !';
  }

  builtRoad(): string {
    return 'You built a road !';
  }

  builtSettlement(): string {
    return 'You built a settlement !';
  }

  builtSomething(): string {
    return 'You built a something !';
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
