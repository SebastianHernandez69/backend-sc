import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { CreateInstitucionDto } from './dto/create-intitucion.dto';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get('/instituciones')
  async getAllInstituciones(){
    return await this.experienceService.getAllInstituciones();
  }

  @Post('/instituciones/add')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async createInstitucion(@Body() createInstitucionDto: CreateInstitucionDto){
    return await this.experienceService.createInstitucion(createInstitucionDto);
  }

  @Get('/puestos')
  async getPuestos(){
    return await this.experienceService.getPuestos();
  }

  @Post('/puestos/add')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async createPuesto(@Body() createPuestoDto: CreatePuestoDto){
    return await this.experienceService.createPuesto(createPuestoDto);
  }
}
