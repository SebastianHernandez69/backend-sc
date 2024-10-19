import { Controller } from '@nestjs/common';
import { MateriaService } from './materia.service';

@Controller('materia')
export class MateriaController {
  constructor(private readonly materiaService: MateriaService) {}
}
