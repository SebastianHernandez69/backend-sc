import { Body, Controller, Get, HttpCode, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { MateriaService } from './materia.service';
import { CategoriaDto } from './dto/categoria-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MateriaDto } from './dto/materia-dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';
import { JwtPayload } from 'src/interfaces/JwtPayload';

@Controller('materia')
export class MateriaController {
  constructor(private readonly materiaService: MateriaService) {}

  @Post('/categoria/add')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addNewCategory(@Body() categoriaDto :CategoriaDto, @UploadedFile() file?: Express.Multer.File){
    return await this.materiaService.addNewCategory(categoriaDto, file);
  }

  @Post('/add')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addNewMateria(@Body() materiaDto: MateriaDto, @UploadedFile() file?: Express.Multer.File){
    return await this.materiaService.addNewMateria(materiaDto, file);
  }

  @Get('/interes-tutor')
  @UseGuards(JwtAuthGuard)
  async getMateriaInteresTutor( @Req() req: Request ){
    const user = req.user as JwtPayload;

    return this.materiaService.getMateriaInteresTutor(user.sub);
  }
}
