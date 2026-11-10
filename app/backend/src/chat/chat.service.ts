import { Injectable } from '@nestjs/common';
import { Prisma, type Chat } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ChatMessage } from '@shared/types'
import { UserService } from 'src/user/user.service';
import { IncomingMessage } from 'node:http';

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

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly userService: UserService
  ) {}

  async getChatHistory(): Promise<ChatMessage[]> {
    // const chatMessages: ChatMessage[] = [
    //   {
    //     id: "1",
    //     date: Date.now(),
    //     content: 'Hello, how are you?',
    //     username: 'JohnDoe'
    //   },
    //   {
    //     id: "2",
    //     date: Date.now() + 1,
    //     content: 'Fine and you ?',
    //     username: 'JaneDoe'
    //   },
    // ]


    const messages = await this.databaseService.chat.findMany({
      include: { user: { select: { username: true } } },
    })

    return messages.map((message ) => this.toChatMessage(message));
  }

  async addChatMessage(userId: string, content: string)  {
    const message = await this.databaseService.chat.create({
      data: {
        content: content,
        user: { connect: { id: userId } },
      },
      include: { user: { select: { username: true } } },
    });
    return this.toChatMessage(message);
  }

  private toChatMessage(chat: ChatWithUser) {
    return {
      id: chat.id,
      date: chat.writedAt.getTime(),
      content: chat.content,
      username: chat.user.username
    }
  }
}
