import {
  Controller,
  Get,
  //Post,
  //Body,
  //Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GamemasterService } from './gamemaster.service';
//import { CreateGamemasterDto } from './dto/create-gamemaster.dto';
//import { UpdateGamemasterDto } from './dto/update-gamemaster.dto';

@Controller('gamemaster')
export class GamemasterController {
  constructor(private readonly gamemasterService: GamemasterService) {}

  //@Post()
  //create(@Body() createGamemasterDto: CreateGamemasterDto) {
  //  return this.gamemasterService.create(createGamemasterDto);
  //}

  @Get('greetings')
  getMessage() {
    return { message: this.gamemasterService.greetingsFromGM() };
  }

  @Get('road')
  getRoad() {
    return { message: this.gamemasterService.builtRoad() };
  }

  @Get('settlement')
  getSettlement() {
    return { message: this.gamemasterService.builtSettlement() };
  }

  @Get('turn')
  getTurn() {
    return { message: this.gamemasterService.yourTurn() };
  }

  @Get('dice')
  getDice() {
    return { message: this.gamemasterService.rolledDice() };
  }

  @Get('something')
  getSomething() {
    return { message: this.gamemasterService.builtSomething() };
  }

  @Get()
  findAll() {
    return this.gamemasterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamemasterService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gamemasterService.remove(+id);
  }
}
