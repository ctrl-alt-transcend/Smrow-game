import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { PlayerProfile } from 'shared';
import type { UserProfile, RegisterPost, UpdateProfile, Id } from 'shared';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async create(usr: RegisterPost) {
    const prismaDtoUser: Prisma.UserCreateInput = {
      username: usr.username,
      name: usr.name,
      email: usr.email,
      localAuth: {
        create: {
          passwordHash: usr.password,
        },
      },
      profile: {
        create: {},
      },
    };

    return await this.databaseService.user.create({
      data: prismaDtoUser,
      include: { profile: true },
    });
  }

  async findById(id: string): Promise<UserProfile | null> {
    const user = await this.databaseService.user.findUniqueOrThrow({
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
      bio: user.profile?.bio ?? undefined,
      avatarURL: user.profile?.avatarURL ?? undefined,
    };
  }

  async findPlayerProfile(id: Id): Promise<PlayerProfile> {
    const user = await this.databaseService.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        profile: { select: { avatarURL: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User not found with id: ${id}`);
    }

    return {
      id: user.id,
      username: user.username,
      avatarURL: user.profile?.avatarURL ?? null,
    };
  }

  // include returns the relations data, if set to true
  async findAll() {
    // to be deleted
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

  async update(id: string, data: UpdateProfile) {
    const { name, username, email, ...profileFields } = data;
    return this.databaseService.user.update({
      where: { id },
      data: {
        name,
        username,
        email,
        profile: Object.keys(profileFields).length
          ? { upsert: { create: profileFields, update: profileFields } }
          : undefined,
      },
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
