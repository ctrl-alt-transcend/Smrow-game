import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { DatabaseService } from '../database/database.service';
import { PlayerProfile, FriendSchema } from 'shared';
import type {
  UserProfile,
  RegisterPost,
  UpdateProfile,
  Id,
  Friend,
} from 'shared';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'avatars');
const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
};

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

  async updatePicture(id: string, file: Express.Multer.File) {
    const user = await this.databaseService.profile.findUnique({
      where: {
        userId: id,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    const filename = `${randomUUID()}.${EXT[file.mimetype]}`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(join(UPLOAD_DIR, filename), file.buffer);

    const updated = await this.databaseService.user.update({
      where: { id },
      data: {
        profile: {
          update: { avatarURL: `/uploads/avatars/${filename}` },
        },
      },
      include: { profile: true },
    });

    if (user.avatarURL?.startsWith('/uploads/avatars/')) {
      await unlink(join(process.cwd(), user.avatarURL)).catch(() => {});
    }

    return updated;
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

  /**
   *
   * @param userId Id of the current user
   * @param friendUsername Username of the target user
   * @returns Prisma object of the newly created or modified friendRequest
   * Create a new friend request in the FriendRequest table.
   * The function performs multiple checks to ensure that no duplicate can be created.
   *
   */
  async addFriend(userId: string, friendUsername: string) {
    const friend = await this.databaseService.user.findUnique({
      where: {
        username: friendUsername,
      },
    });

    if (!friend) throw new NotFoundException('User not found.');

    if (friend.id === userId) throw new BadRequestException();

    const existing = await this.databaseService.friendRequest.findFirst({
      where: {
        OR: [
          { sender_id: userId, receiver_id: friend.id },
          { sender_id: friend.id, receiver_id: userId },
        ],
      },
    });

    if (!existing) {
      return this.databaseService.friendRequest.create({
        data: {
          sender_id: userId,
          receiver_id: friend.id,
        },
      });
    }

    if (existing.status === 'PENDING' && existing.sender_id === friend.id) {
      return this.databaseService.friendRequest.update({
        where: { id: existing.id },
        data: { status: 'ACCEPTED' },
      });
    }

    if (existing.status === 'PENDING' || existing.status === 'ACCEPTED')
      throw new ConflictException(
        'You are either alrready friends or a request is pending.',
      );

    if (existing.status === 'DECLINED') {
      return this.databaseService.friendRequest.update({
        where: { id: existing.id },
        data: {
          status: 'PENDING',
          sender_id: userId,
          receiver_id: friend.id,
        },
      });
    }
  }
}
