import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValoracionDto } from './dto/valoracion.dto';
import { ComentarioDto } from './dto/comentario.dto';

@Injectable()
export class ValoracionService {

    constructor(private readonly prismaService: PrismaService){}

    async getValoracion(idUsuario: number){
        try {
            const resultValoracion = await this.prismaService.valoracion.aggregate({
                _avg:{
                    valoracion: true
                },
                _count: {
                    valoracion: true
                },
                where: {
                    idUsuarioRecibe: idUsuario
                }
            });

            const promValoracion = resultValoracion._avg.valoracion;
            const numValoracion = resultValoracion._count.valoracion;

            return {
                promedio: promValoracion,
                cant: numValoracion
            };
            
        } catch (error) {
            throw new BadRequestException(`Error al obtener las valoraciones ${error}`);
        }
    }

    // Add valoracion
    async addValoracion(valoracionDto: ValoracionDto, idUsuarioDa: number){
        const { idUsuarioRecibe, valoracion } = valoracionDto;
        try {
            const newVal = await this.prismaService.valoracion.create({
                data: {
                    idUsuarioDa,
                    idUsuarioRecibe,
                    valoracion,
                    fechaValoracion: new Date()
                }
            });

            const { promedio, cant } = await this.getValoracion(idUsuarioRecibe);

            const upValoracionUser = await this.prismaService.usuario.update({
                where:{
                    idUsuario: idUsuarioRecibe
                },
                data: {
                    valoracion: promedio
                }
            });
            
            return {
                promedio: promedio,
                cant: cant
            }

        } catch (error) {
            throw new BadRequestException(`Error al agregar una valoracion: ${error}`);
        }
    }

    // 
    async addComentario(comentarioDto: ComentarioDto, idPupilo: number){
        const { idUsuarioRecibeComentario, comentario } = comentarioDto;

        try {
            const nvoComentario = await this.prismaService.comentario.create({
                data: {
                    idUsuarioComenta: idPupilo,
                    idUsuarioRecibeComentario,
                    comentario: comentario,
                    fechaComentario: new Date()
                }
            });

            if(!nvoComentario){
                throw new BadRequestException("Error al crear comentario")
            }

            return nvoComentario;

        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    //
    async getComentariosTutor(idTutor: number){
        try {
            const comentarios = await this.prismaService.comentario.findMany({
                where: {
                    idUsuarioRecibeComentario: idTutor
                },
                select: {
                    usuario_comentario_idUsuarioComentaTousuario: {
                        select: {
                            nombre: {
                                select: {
                                    primerNombre: true,
                                    primerApellido: true
                                }
                            },
                            fotoPerfil: true
                        }
                    },
                    comentario: true,
                    fechaComentario: true
                }
            });

            // Transformar el resultado a la estructura deseada
            const comentariosFormateados = comentarios.map((c) => ({
                nombre: {
                    primerNombre: c.usuario_comentario_idUsuarioComentaTousuario.nombre.primerNombre,
                    primerApellido: c.usuario_comentario_idUsuarioComentaTousuario.nombre.primerApellido,
                },
                foto: c.usuario_comentario_idUsuarioComentaTousuario.fotoPerfil,
                comentario: c.comentario,
                fecha: c.fechaComentario,
            }));

            return comentariosFormateados;
        } catch (error) {
            throw new BadRequestException(`Error al obtener comentarios del tutor: ${error}`);
        }
    }
}
