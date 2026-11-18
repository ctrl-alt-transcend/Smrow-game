import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PlayerProfile, FriendSchema } from 'shared';
import type { UserProfile, Friend } from 'shared';

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

  async findPlayerProfile(id: string): Promise<PlayerProfile> {
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

  //  async findOne(username: string) {
  //    return this.databaseService.user.findUniqueOrThrow({
  //      where: {
  //        username,
  //      },
  //    });
  //  }

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

  async getFriendList(id: string): Promise<Friend[]> {
    const profileSelect = {
      id: true,
      username: true,
      profile: {
        select: { avatarURL: true, bio: true },
      },
    } as const;

    const requests = await this.databaseService.friendRequest.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ sender_id: id }, { receiver_id: id }],
      },
      select: {
        sender: { select: profileSelect },
        receiver: { select: profileSelect },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(({ sender, receiver }) => {
      const other = sender.id === id ? receiver : sender;

      return FriendSchema.parse({
        id: other.id,
        username: other.username,
        avatar: other.profile?.avatarURL ?? undefined,
        bio: other.profile?.bio ?? undefined,
      });
    });
  }

  async removeFriend(userId: string, friendId: string) {
    return this.databaseService.friendRequest.deleteMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { receiver_id: friendId, sender_id: userId },
          { receiver_id: userId, sender_id: friendId },
        ],
      },
    });
  }
}
