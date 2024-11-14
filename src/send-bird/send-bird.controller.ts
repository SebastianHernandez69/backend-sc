import { Controller } from '@nestjs/common';
import { SendBirdService } from './send-bird.service';

@Controller('send-bird')
export class SendBirdController {
  constructor(private readonly sendBirdService: SendBirdService) {}
}
