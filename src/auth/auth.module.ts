import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailService } from 'src/email/email.service';

@Module({
  providers: [AuthService,EmailService],
  controllers: [AuthController],
  imports: [PrismaModule]
})
export class AuthModule {}
