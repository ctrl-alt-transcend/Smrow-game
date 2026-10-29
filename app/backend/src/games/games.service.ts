import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GamesService {
  constructor(private readonly databaseService: DatabaseService) {}
  create(createGameDto: Prisma.GamesCreateInput) {
    return this.databaseService.games.create({
      data: createGameDto,
    });
  }

  findAll() {
    return this.databaseService.games.findMany();
  }

  findOne(id: string) {
    return this.databaseService.games.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  update(id: string, updateGameDto: Prisma.GamesCreateInput) {
    return this.databaseService.games.update({
      where: {
        id,
      },
      data: updateGameDto,
    });
  }

  remove(id: string) {
    return this.databaseService.games.delete({
      where: {
        id,
      },
    });
  }
}
