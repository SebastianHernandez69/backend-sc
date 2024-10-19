import { Module } from '@nestjs/common';
import { MateriaService } from './materia.service';
import { MateriaController } from './materia.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [MateriaController],
  providers: [MateriaService],
  imports: [PrismaModule]
})
export class MateriaModule {}
