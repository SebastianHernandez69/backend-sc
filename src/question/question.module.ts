import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AnswerQuestionGateway } from 'src/accepted-question/answer-question.gateway';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [QuestionController],
  providers: [QuestionService, AnswerQuestionGateway],
  imports: [PrismaModule, CloudinaryModule]
})
export class QuestionModule {}
