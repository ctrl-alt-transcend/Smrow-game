import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import type { UserProfile } from '@shared/types';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const prismaDtoUser: Prisma.UserCreateInput = {
      username: createUserDto.username,
      name: createUserDto.name,
      email: createUserDto.email,
      localAuth: {
        create: {
          passwordHash: createUserDto.password,
        },
      },
    };

    return await this.databaseService.user.create({
      data: prismaDtoUser,
    });
  }

  async findById(id: string): Promise<UserProfile | null> {
    const user = await this.databaseService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            avatarURL: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
      bio: user.profile?.bio ?? null,
      avatarURL: user.profile?.avatarURL ?? null,
    };
  }

  // include returns the relations data, if set to true
  async findAll() {
    return this.databaseService.user.findMany({
      include: { profile: true, localAuth: false },
    });
  }

  async findbyUsername(username: string) {
    return this.databaseService.user.findUniqueOrThrow({
      where: {
        username,
      },
    });
  }

  async findOne(username: string) {
    return this.databaseService.user.findUniqueOrThrow({
      where: {
        username,
      },
    });
  }

  async findByMail(email: string) {
    return this.databaseService.user.findUniqueOrThrow({
      where: {
        email,
      },
      include: {
        localAuth: true,
      },
    });
  }

  async update(id: string, updateUserDto: Prisma.UserUpdateInput) {
    return this.databaseService.user.update({
      where: {
        id,
      },
      data: updateUserDto,
    });
  }

  async removeUser(username: string) {
    return this.databaseService.user.delete({
      where: {
        username,
      },
    });
  }

  async remove(id: string) {
    return this.databaseService.user.delete({
      where: {
        id,
      },
    });
  }
}
