import { Module } from '@nestjs/common';
import { SendBirdService } from './send-bird.service';
import { SendBirdController } from './send-bird.controller';

@Module({
  controllers: [SendBirdController],
  providers: [SendBirdService],
})
export class SendBirdModule {}
