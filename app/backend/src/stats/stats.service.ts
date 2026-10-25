import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class StatsService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createStatDto: Prisma.GamesPlayerCreateInput) {
    return await this.databaseService.gamesPlayer.create({
      data: createStatDto,
    });
  }

  async findAll() {
    return this.databaseService.gamesPlayer.findMany();
  }

  async findOne(userId: string, gameId: string) {
    return this.databaseService.gamesPlayer.findUniqueOrThrow({
      where: {
        gameId_userId: {
          gameId: gameId,
          userId: userId,
        },
      },
    });
  }

  async update(
    userId: string,
    gameId: string,
    updateStatDto: Prisma.GamesPlayerUpdateInput,
  ) {
    return this.databaseService.gamesPlayer.update({
      where: {
        gameId_userId: {
          userId: userId,
          gameId: gameId,
        },
      },
      data: updateStatDto,
    });
  }

  async remove(userId: string, gameId: string) {
    return this.databaseService.gamesPlayer.delete({
      where: {
        gameId_userId: {
          gameId: gameId,
          userId: userId,
        },
      },
    });
  }
}
