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

  @Get('gamemasterGreetings')
  getMessage() {
    return { message: this.gamemasterService.greetingsFromGM() };
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
