import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './home/home.module';
import { EmailService } from './email/email.service';
import { CategoriesModule } from './categories/categories.module';
import { MateriaModule } from './materia/materia.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, PrismaModule, HomeModule, CategoriesModule, MateriaModule, UserModule],
  controllers: [],
  providers: [EmailService],
})
export class AppModule {}
