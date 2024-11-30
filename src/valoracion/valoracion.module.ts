import { Module } from '@nestjs/common';
import { ValoracionService } from './valoracion.service';
import { ValoracionController } from './valoracion.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ValoracionController],
  providers: [ValoracionService],
  imports: [PrismaModule]
})
export class ValoracionModule {}
