import { Body, Controller, Delete, UseGuards } from '@nestjs/common';
import { QuestionService } from './question.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Delete('/delete')
  @UseGuards(JwtAuthGuard)
  async deleteQuestion(@Body('idPregunta') idPregunta: number){
    return await this.questionService.deleteQuestion(idPregunta);
  }
}
