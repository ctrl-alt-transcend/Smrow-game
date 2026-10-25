import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StatsService } from './stats.service';
import { Prisma } from '@prisma/client';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Post()
  create(@Body() createStatDto: Prisma.GamesPlayerCreateInput) {
    return this.statsService.create(createStatDto);
  }

  @Get() // to be deleted?
  findAll() {
    return this.statsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') userId: string, gameId: string) {
    return this.statsService.findOne(userId, gameId);
  }

  @Patch(':id')
  update(@Param('id') userId: string, gameId: string, @Body() updateStatDto: Prisma.GamesPlayerUpdateInput) {
    return this.statsService.update(userId, gameId, updateStatDto);
  }

  @Delete(':id')
  remove(@Param('id') userId: string, gameId: string) {
    return this.statsService.remove(userId, gameId);
  }
}
