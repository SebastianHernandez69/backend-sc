import { Module } from '@nestjs/common';
import { StreamchatService } from './streamchat.service';
import { StreamchatController } from './streamchat.controller';

@Module({
  controllers: [StreamchatController],
  providers: [StreamchatService],
  exports: [StreamchatService]
})
export class StreamchatModule {}
