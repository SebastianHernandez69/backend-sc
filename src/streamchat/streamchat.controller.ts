import { Body, Controller, Get, Post } from '@nestjs/common';
import { StreamchatService } from './streamchat.service';
import { CreateChannelDto } from './dto/create-channel.dto';

@Controller('streamchat')
export class StreamchatController {
  constructor(private readonly streamchatService: StreamchatService) {}

  @Get('/token')
  async getToken(){
    return this.streamchatService.generateToken('');
  }

  @Post('/channel/create')
  async createPrivateChannel(@Body() createChannelDto: CreateChannelDto){
    const { userId1, userId2} = createChannelDto;
    return this.streamchatService.createPrivateChannel(userId1, userId2);
  }
}
