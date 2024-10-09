import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './home/home.module';

@Module({
  imports: [AuthModule, PrismaModule, HomeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
