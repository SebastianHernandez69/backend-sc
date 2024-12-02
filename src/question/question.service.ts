import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AnswerQuestionGateway } from 'src/accepted-question/answer-question.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ansQuestionSelect } from './dto/ansPregunta-select';

@Injectable()
export class QuestionService {
    constructor(private readonly prismaService: PrismaService, 
        private answerQuestionGateway: AnswerQuestionGateway,
        private cloudinaryService: CloudinaryService,
    ){}

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

    // mark question as answered
    async markQuestionAnswered(idPregunta: number, idTutor: number){
        try {
            const updateQuestionState = await this.prismaService.pregunta.update({
                where: {
                    idPregunta
                },
                data: {
                    idEstadoPregunta: 3
                }
            });

            if(!updateQuestionState) {
                throw new BadRequestException("Error al marcar pregunta como contestada")
            }
            const answQuestion = await this.prismaService.pregunta_contestada.create({
                data:{
                    idPregunta: updateQuestionState.idPregunta,
                    idTutor: idTutor,
                    idPupilo: updateQuestionState.idUsuarioPupilo,
                    fechaContestada: new Date()
                }
            });

            this.answerQuestionGateway.notifyQuestionAnswered(answQuestion.idPregunta, answQuestion.idTutor);
            
            return answQuestion.idPreguntaContestada;
        } catch (error) {
            throw new BadRequestException(`Error al cambiar estado a contestado de la pregunta: ${error}`);
        }
    }

    async getAnsQuestionsByRole(idUsuario: number, idRol: number) {
        const where = idRol === 1 
            ? { idTutor: idUsuario } 
            : { idPupilo: idUsuario }; // Cambiar la condición según tu lógica
    
        const userSelectField = idRol === 1 
            ? 'usuario_pregunta_contestada_idPupiloTousuario'
            : 'usuario';
    
        try {
            const ansQuestions = await this.prismaService.pregunta_contestada.findMany({
                where,
                select: {
                    ...ansQuestionSelect,
                    [userSelectField]: {
                        select: {
                            nombre: true,
                        },
                    },
                },
            });
    
            return ansQuestions.map((q) => ({
                titulo: q.pregunta.titulo,
                descripcion: q.pregunta.descripcion,
                materia: q.pregunta.materia.materia,
                nombre: {
                    primerNombre: q[userSelectField].nombre.primerNombre,
                    segundoNombre: q[userSelectField].nombre.segundoNombre,
                    primerApellido: q[userSelectField].nombre.primerApellido,
                    segundoApellido: q[userSelectField].nombre.segundoApellido,
                },
                fechaContestada: q.fechaContestada,
            }));
        } catch (error) {
            throw new BadRequestException(`Error al obtener las preguntas contestadas`);
        }
    }
    
    // Get question by id
    async getQuestionById(idPregunta: number){
        try {
            const question = await this.prismaService.pregunta.findUnique({
                where: {
                    idPregunta
                },
                include: {
                    imgpregunta: true
                }
            });

            if(!question){
                throw new NotFoundException('Pregunta no encontrada');
            }

            return question;
        } catch (error) {
            if(error instanceof NotFoundException){
                throw error;
            }

            throw new BadRequestException(`Error al obtener la pregunta`);
        }
    }

    // delete question img
    async deleteQuestionImg(idImg: number){
        try {
            const deletedImg = await this.prismaService.imgpregunta.delete({
                where: {
                    idImg
                }
            });

            if(!deletedImg){
                throw new BadRequestException(`Error al eliminar img`)
            }

            return deletedImg;
        } catch (error) {
            throw new BadRequestException(`Error al eliminar imagen: ${error}`);
        }
    }

    // update question
    async updateQuestion(idPregunta: number ,updateQuestionDto?: UpdateQuestionDto, files?: Express.Multer.File[]){
        const { titulo, descripcion } = updateQuestionDto;
        
        try {
            const question = await this.prismaService.pregunta.findUnique({
                where: {idPregunta}
            });

            if(!question){
                throw new NotFoundException(`Pregunta no encontrada`);
            }

            if(question.idEstadoPregunta !== 1){
                throw new ConflictException(`No se puede editar - pregunta ya aceptada o contestada`);
            }

            const updatedQuestion = await this.prismaService.pregunta.update({
                where: {
                    idPregunta
                },
                data: {
                    titulo,
                    descripcion
                },
                include: {
                    imgpregunta: true
                }
            });

            if(files.length > 0){
                const uploadImgs = files.map(async(file) => {
                    const imgUrl = await this.cloudinaryService.uploadFile(file, "imgPreguntas");
                    await this.prismaService.imgpregunta.create({
                        data: {
                            idPregunta,
                            img: imgUrl
                        }
                    });
                });

                await Promise.all(uploadImgs);
            }

            return updatedQuestion;
        } catch (error) {
            if(error instanceof NotFoundException){
                throw error;
            }
            if(error instanceof ConflictException){
                throw error;
            }
            throw new BadRequestException(`Error al actualizar la pregunta: ${error}`);
        }
    }
}
