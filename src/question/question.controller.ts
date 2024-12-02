import { Body, Controller, Delete, Get, Param, Patch, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { QuestionService } from './question.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';
import { JwtPayload } from 'src/interfaces/JwtPayload';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Delete('/delete')
  @UseGuards(JwtAuthGuard)
  async deleteQuestion(@Body('idPregunta') idPregunta: number){
    return await this.questionService.deleteQuestion(idPregunta);
  }

  @Patch('/answere-question')
  @UseGuards(JwtAuthGuard)
  async markQuestionAnswered(@Body('idPregunta') idPregunta: number, @Req() req: Request){
    const user = req.user as JwtPayload;
    return await this.questionService.markQuestionAnswered(idPregunta, user.sub)
  }

  @Get('/get/:idPregunta')
  async getQuestionById(@Param("idPregunta") idPregunta:number){
    return await this.questionService.getQuestionById(Number(idPregunta));
  }

  @Delete('/img/delete/:idImg')
  async deleteQuestionImg(@Param("idImg") idImg: number){
    return await this.questionService.deleteQuestionImg(Number(idImg));
  }

  @Patch('/update/:idPregunta')
  @UseInterceptors(FilesInterceptor('files', 3))
  async updateQuestion(@Param("idPregunta") idPregunta: number, @Body() updateQuestionDto?: UpdateQuestionDto, @UploadedFiles() files?: Express.Multer.File[]){
    return await this.questionService.updateQuestion(Number(idPregunta),updateQuestionDto, files || [])
  }

  @Get('/answer-question/get')
  @UseGuards(JwtAuthGuard)
  async getAnsQuestionsByRole(@Req() req: Request){
    const user = req.user as JwtPayload;

    return await this.questionService.getAnsQuestionsByRole(user.sub, user.rol);
  }
}
