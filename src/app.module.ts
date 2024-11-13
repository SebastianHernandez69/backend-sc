import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './home/home.module';
import { EmailService } from './email/email.service';
import { CategoriesModule } from './categories/categories.module';
import { MateriaModule } from './materia/materia.module';
import { UserModule } from './user/user.module';
import { S3Module } from './s3/s3.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AuthModule, PrismaModule, HomeModule, CategoriesModule, MateriaModule, UserModule, 
    S3Module, ConfigModule.forRoot({isGlobal: true}), AdminModule],
  controllers: [],
  providers: [EmailService],
})
export class AppModule {}
