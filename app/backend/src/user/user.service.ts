import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    const username = Prisma
    return this.databaseService.user.create( {
      data: createUserDto
    })
  }

  async findAll() {
    return this.databaseService.user.findMany( {include: {profile: true, localAuth:true}} )
  }

  async findbyUsername(username: string) {
    return this.databaseService.user.findUnique({
      where: {
        username,
      }
    });
  }

  async findOne(id: string) {
    return this.databaseService.user.findUnique( {
      where: {
        id,
      }
    });
  }

  async findByMail(email: string) {
    return this.databaseService.user.findUnique( {
      where: {
        email,
      }
    });
  }

  async update(id: string, updateUserDto: Prisma.UserUpdateInput) {
    return this.databaseService.user.update({
      where: {
        id,
      },
      data: updateUserDto,
    } );
  }

  async removeUser(username: string) {
    return this.databaseService.user.delete( {
      where: {
        username,
      },
    });
  }

  async remove(id: string) {
    return this.databaseService.user.delete( {
      where: {
        id,
      }
    });
  }
}
