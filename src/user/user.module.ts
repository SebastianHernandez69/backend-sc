import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { S3Module } from 'src/s3/s3.module';
import { OfferNotificationGateway } from 'src/offer-notification/offer-notification.gateway';

@Module({
  controllers: [UserController],
  providers: [UserService,OfferNotificationGateway],
  imports: [PrismaModule, S3Module]
})
export class UserModule {}
