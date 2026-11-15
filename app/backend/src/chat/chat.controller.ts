import { Controller, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessage } from 'shared';

@Controller('chat')
export class ChatController {
  constructor(readonly chatService: ChatService) {}

  @Get()
  async getChatHistory(): Promise<ChatMessage[]> {
    return await this.chatService.getChatHistory();
  }
}
