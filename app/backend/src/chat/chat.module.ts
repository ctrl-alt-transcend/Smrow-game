import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService]
})
export class ChatModule {}
