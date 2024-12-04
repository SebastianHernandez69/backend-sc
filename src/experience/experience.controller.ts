import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { CreateInstitucionDto } from './dto/create-intitucion.dto';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';
import { JwtPayload } from 'src/interfaces/JwtPayload';

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

  @Get('/user/get')
  @UseGuards(JwtAuthGuard)
  async getExperienciaIdUsuario(@Req() req: Request){
    const user = req.user as JwtPayload;

    return await this.experienceService.getExperienciaIdUsuario(user.sub);
  }

  @Get('/user/conocimiento/get')
  @UseGuards(JwtAuthGuard)
  async getConocimientoIdUsuario(@Req() req: Request){
    const user = req.user as JwtPayload;

    return await this.experienceService.getConocimientoIdUsuario(user.sub);
  }
}
