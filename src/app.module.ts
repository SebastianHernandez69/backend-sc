import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './home/home.module';
import { EmailService } from './email/email.service';

@Module({
  imports: [AuthModule, PrismaModule, HomeModule],
  controllers: [],
  providers: [EmailService],
})
export class AppModule {}
