import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';
import { JwtPayload } from 'src/interfaces/JwtPayload';
import { PreguntaDto } from './dto/pregunta.dto';
import { OfertaPreguntaDto } from './dto/oferta-pregunta.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  // Uptade uesr info
  @Patch("/update-info")
  @UseGuards(JwtAuthGuard)
  async updatedUserInfo(@Req() req: Request, @Body() updateUserDto: UpdateUserDto){
    const user = req.user as JwtPayload;

    return await this.userService.updateUserInfo(user.sub, updateUserDto);
  }

  // Tutor envia oferta de solicion a pregunta
  @Post("/pregunta/send-offer")
  @UseGuards(JwtAuthGuard)
  async sendOfertaSolucion(@Req() req: Request, @Body() ofertaPreguntaDto: OfertaPreguntaDto){
    const user = req.user as JwtPayload;
    if(user.rol === 1){
      return await this.userService.sendOfertaSolucion(user.sub, ofertaPreguntaDto);
    }
  }

  // Get all questions from a pupil
  @Get("/preguntas")
  @UseGuards(JwtAuthGuard)
  async obtenerPreguntasPupilo(@Req() req: Request){
    const user = req.user as JwtPayload;
    return this.userService.obtenerPreguntasPupilo(user.sub);
  }

  // Get all questions by materia_tutor
  @Get("/pregunta/interes-tutor")
  @UseGuards(JwtAuthGuard)
  async obtenerPreguntasInteresTutor(@Req() req: Request){
    const user = req.user as JwtPayload;

    return await this.userService.obtenerPreguntasInteresTutor(user.sub);
  }
}
