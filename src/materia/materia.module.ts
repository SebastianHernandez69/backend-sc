import { Module } from '@nestjs/common';
import { MateriaService } from './materia.service';
import { MateriaController } from './materia.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  controllers: [MateriaController],
  providers: [MateriaService],
  imports: [PrismaModule, S3Module]
})
export class MateriaModule {}
