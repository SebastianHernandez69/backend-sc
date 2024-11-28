import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuestionService {
    constructor(private readonly prismaService: PrismaService){}

    // delete question
    async deleteQuestion(idPregunta: number){

        try {
            const pregunta = await this.prismaService.pregunta.findUnique({
                where: {
                    idPregunta
                }
            });

            if(!pregunta){
                throw new BadRequestException(`La pregunta no existe`);
            }

            if(pregunta.idEstadoPregunta !== 1){
                throw new ConflictException(`Pregunta ya aceptada o contestada`);
            }

            await this.prismaService.$transaction([
                this.prismaService.imgpregunta.deleteMany({ where: { idPregunta } }),
                this.prismaService.ofertaresolucion.deleteMany({ where: { idPregunta } }),
                this.prismaService.pregunta.delete({ where: { idPregunta } }),
            ]);

            return { message: "Pregunta eliminada con éxito" };
        } catch (error) {
            if(error instanceof ConflictException){
                throw error;
            }

            throw new BadRequestException(`Error al eliminar la pregunta: ${error}`)
        }

    }
}
