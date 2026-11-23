import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { ChatMessage } from 'shared';
import { Logger } from '@nestjs/common';

/**
 * @brief Prisma options to fetch a message along with its author.
 *
 * Includes the user linked to each message
 * Only the username is selected
 */
const chatWithUser = {
  include: { user: { select: { username: true } } },
} satisfies Prisma.ChatDefaultArgs;

/**
 * @brief Type of a message returned by a query using chatWithUser.
 *
 * New type based on Chat Type
 * Contains every Chat field and the username
 */
type ChatWithUser = Prisma.ChatGetPayload<typeof chatWithUser>;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getChatHistory(): Promise<ChatMessage[]> {
    const messages = await this.databaseService.chat.findMany({
      include: { user: { select: { username: true } } },
    });
    return messages.map((message) => this.toChatMessage(message));
  }

  async addChatMessage(userId: string, content: string) {
    const message = await this.databaseService.chat.create({
      data: {
        content: content,
        user: { connect: { id: userId } },
      },
      include: chatWithUser.include,
    });
    this.logger.verbose(`${userId} sent a chat message: ${content}`);
    return this.toChatMessage(message);
  }

  private toChatMessage(chat: ChatWithUser) {
    return {
      id: chat.id,
      date: chat.writedAt.getTime(),
      content: chat.content,
      username: chat.user.username,
    };
  }
}
