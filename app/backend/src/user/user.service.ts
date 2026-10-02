import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const prismaDtoUser : Prisma.UserCreateInput = {
      username: createUserDto.username,
      name: createUserDto.name,
      email: createUserDto.email,
      localAuth: {
        create: {
          passwordHash: createUserDto.password,
        }
      },
    }

    return this.databaseService.user.create( {
      data: prismaDtoUser,
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
      },
      include: {
        localAuth: true,
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
