import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PreguntaDto } from './dto/pregunta.dto';
import { format } from 'date-fns';
import { OfertaPreguntaDto } from './dto/oferta-pregunta.dto';
import e from 'express';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {

    constructor(private prismaService: PrismaService){

    }

    // Agregar materias de interes al pupilo
    async addMateriaToUser(idUsuario: number, idMateria: number, idRol: number){

        try{
            if(idRol === 2){
                const interesPupilo = await this.prismaService.interes_pupilo.create({
                    data:{
                        idMateria: idMateria,
                        idUsuario: idUsuario
                    }
                });
        
                return interesPupilo;
            }
            
            if(idRol === 1){
                const interesTutor = await this.prismaService.materia_tutor.create({
                    data: {
                        idMateria: idMateria,
                        idUsuario: idUsuario
                    }
                });

                return interesTutor;
            }

        }catch(error){
            throw new BadRequestException("Error al ingresar materia interes usuario: "+error);
        }
    }


    // Preguntas pupilo
    async addPreguntaPupilo(idUsuario: number,preguntaDto: PreguntaDto){

        const now = new Date();

        try{
            const pregunta = await this.prismaService.pregunta.create({
                data: {
                    idMateria: preguntaDto.idMateria,
                    idUsuarioPupilo: idUsuario,
                    titulo: preguntaDto.titulo,
                    descripcion: preguntaDto.descripcion,
                    idEstadoPregunta: preguntaDto.idEstadoPregunta,
                    fechaPublicacion: now
                }
            });

            return pregunta;
        }catch(error){
            throw new BadRequestException("Error al crear pregunta: "+error);
        }

    }

    // Perfil usuario
    async getUserProfile(idUsuario: number, idRol: number){
        if(idRol === 1){
            return this.getUserProfileTutor(idUsuario);
        }
        else if(idRol === 2){
            return this.getUserProfilePupilo(idUsuario);
        }
        else {
            throw new BadRequestException("Rol no valido");
        }
    }

    async getUserProfilePupilo(idUsuario: number){
        try {
            const user = await this.prismaService.usuario.findUnique({
                where: {idUsuario},
                select: {
                    nombre: true,
                    edad: true,
                    correo: true,
                    dni: true,
                    telefono: true,
                    valoracion: true,
                    fotoPerfil: true,
                    horarioDisponibleInicio: true,
                    horarioDisponibleFin:true,
                    rol: true,
                    pregunta: true
                }
            });
    
            return user;
        } catch (error) {
            throw new BadRequestException("Error al obtener perfil pupilo" + error);
        }
    }

    async getUserProfileTutor(idUsuario: number){
        try {
            const user = await this.prismaService.usuario.findUnique({
                where: {idUsuario},
                select: {
                    nombre: true,
                    edad: true,
                    correo: true,
                    dni: true,
                    telefono: true,
                    valoracion: true,
                    fotoPerfil: true,
                    horarioDisponibleInicio: true,
                    horarioDisponibleFin:true,
                    rol: true,
                    experiencia: true,
                    conocimiento: true
                }
            });
    
            return user;
        } catch (error) {
            throw new BadRequestException("Error a obtener perfil tutor: " + error);
        }
    }

    // Get all questions from a pupil
    async obtenerPreguntasPupilo(idPupilo: number){
        try{

            const preguntas = await this.prismaService.pregunta.findMany({
                where: { idUsuarioPupilo: idPupilo },
                orderBy: {
                    fechaPublicacion: "asc"
                }
            });

            return preguntas;

        }catch(ex){
            throw new BadRequestException("Error al obtener las preguntas"+ex);
        }
    }

    // Get questions by materia_tutor
    async obtenerPreguntasInteresTutor(idTutor: number){
        const preguntasInteresTutor = await this.prismaService.pregunta.findMany({
            where: {
                materia: {
                    materia_tutor: {
                        some: {
                            idUsuario: idTutor
                        }
                    }
                }
            },
            orderBy: {
                fechaPublicacion: "desc"
            }
        });

        return preguntasInteresTutor;
    }

    // Tutor envia oferta de solucion a la pregunta
    async sendOfertaSolucion(idTutor: number, ofertaPreguntaDto: OfertaPreguntaDto){

        try {
            const existOferta = await this.prismaService.ofertaresolucion.findFirst({
                where:{
                    idUsuarioTutor: idTutor,
                    idPregunta: ofertaPreguntaDto.idPregunta
                }
            });
    
            if(existOferta){
               throw new BadRequestException("Ya se envio una oferta para esta pregunta"); 
            }
    
            const nvaOfertaPregunta = await this.prismaService.ofertaresolucion.create({
                data: {
                    idUsuarioTutor: idTutor,
                    idPregunta: ofertaPreguntaDto.idPregunta,
                    idEstadoOferta: 1,
                    descripcion: ofertaPreguntaDto.descripcion,
                    fechaOferta: new Date()
                }
            });
            return nvaOfertaPregunta;
        } catch (error) {
            throw new BadRequestException("Error al enviar la oferta: "+error);
        }
    }

    async updateUserInfo(idUsuario: number, updateUserDto: UpdateUserDto){

        try{

            const user = await this.prismaService.usuario.findUnique({
                where: {idUsuario}
            })

            const idNombre = user.idNombre;
            const updatedUsername = await this.prismaService.nombre.update({
                where: {idNombre: idNombre},
                data: {
                    primerNombre: updateUserDto.primerNombre,
                    segundoNombre: updateUserDto.segundoNombre,
                    primerApellido: updateUserDto.primerApellido,
                    segundoApellido: updateUserDto.segundoApellido
                }
            });

            const updatedUserInfo = await this.prismaService.usuario.update({
                where: {
                    idUsuario
                },
                data: {
                    edad: updateUserDto.edad,
                    telefono: updateUserDto.telefono,
                    dni: updateUserDto.dni,
                    horarioDisponibleFin: updateUserDto.horarioDisponibleFin,
                    horarioDisponibleInicio: updateUserDto.horarioDisponibleInicio
                }
            });

            const { contrasenia: _, ...useWithoutPass} = updatedUserInfo;

            return {
                updatedName: updatedUsername,
                updatedUserInfo: useWithoutPass
            }

        } catch(error){
            throw new BadRequestException("Error al actualizar la informacion de usuario"+error)
        }

    }

}
