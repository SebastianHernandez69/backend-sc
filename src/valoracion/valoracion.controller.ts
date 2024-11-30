import { Body, Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ValoracionService } from './valoracion.service';
import { ValoracionDto } from './dto/valoracion.dto';
import { Request } from 'express';
import { JwtPayload } from 'src/interfaces/JwtPayload';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ComentarioDto } from './dto/comentario.dto';

@Controller('valoracion')
export class ValoracionController {
  constructor(private readonly valoracionService: ValoracionService) {}

  @Get('/get/:idUsuario')
  async getValoracion(@Param("idUsuario") idUsuario: string){
    return await this.valoracionService.getValoracion(Number(idUsuario));
  }

  @Post('/add')
  @UseGuards(JwtAuthGuard)
  async addValoracion(@Body() valoracionDto: ValoracionDto, @Req() req: Request){
    const user = req.user as JwtPayload;

    return await this.valoracionService.addValoracion(valoracionDto, user.sub);
  }

  @Get("/comentarios/get/:idTutor")
  async getComentariosTutor(@Param("idTutor") idTutor: number){
    return await this.valoracionService.getComentariosTutor(Number(idTutor));
  }

  @Post("/comentarios/add")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async addComentario(@Body() comentarioDto: ComentarioDto, @Req() req: Request){
    const user = req.user as JwtPayload;

    return await this.valoracionService.addComentario(comentarioDto, user.sub);
  }
}
