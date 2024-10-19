import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';
import { JwtPayload } from 'src/interfaces/JwtPayload';
import { PreguntaDto } from './dto/pregunta.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/materia-interes/add')
  @UseGuards(JwtAuthGuard)
  async addMateriaToUser(@Req() req: Request){

    const user = req.user as JwtPayload;
    return await this.userService.addMateriaToUser(user.sub, req.body.idMateria, user.rol);
  }

  // Preguntas
  @Post('/pregunta/add')
  @UseGuards(JwtAuthGuard)
  async addPreguntaPupilo(@Req() req: Request, @Body() preguntaDto: PreguntaDto){

    const user = req.user as JwtPayload;
    return await this.userService.addPreguntaPupilo(user.sub, preguntaDto);

  }

  //Perfil del usuario
  @Get("/profile")
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@Req() req: Request){
    const user = req.user as JwtPayload;
    return await this.userService.getUserProfile(user.sub, user.rol);
  }
}
