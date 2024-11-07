import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PreguntaDto } from './dto/pregunta.dto';
import { format } from 'date-fns';
import { OfertaPreguntaDto } from './dto/oferta-pregunta.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { S3Service } from 'src/s3/s3.service';
import { preguntaSelect } from './dto/pregunta-select';
import { AceptarOfertaDto } from './dto/aceptar-oferta.dto';

@Injectable()
export class UserService {

    constructor(private prismaService: PrismaService, private readonly s3Service: S3Service){

    }

    // Agregar materias de interes al pupilo
    async addMateriaToUser(idUsuario: number, idMateria: string, idRol: number){

        try{
            if(idRol === 2){
                const interesPupilo = await this.prismaService.interes_pupilo.create({
                    data:{
                        idMateria: parseInt(idMateria),
                        idUsuario: idUsuario
                    }
                });
        
                return interesPupilo;
            }
            
            if(idRol === 1){
                const interesTutor = await this.prismaService.materia_tutor.create({
                    data: {
                        idMateria: parseInt(idMateria),
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
    async addPreguntaPupilo(idUsuario: number,preguntaDto: PreguntaDto, files: Express.Multer.File[]){

        const now = new Date();

        try{
            const pregunta = await this.prismaService.pregunta.create({
                data: {
                    idMateria: parseInt(preguntaDto.idMateria),
                    // idMateria: preguntaDto.idMateria,
                    idUsuarioPupilo: idUsuario,
                    titulo: preguntaDto.titulo,
                    descripcion: preguntaDto.descripcion,
                    idEstadoPregunta: parseInt(preguntaDto.idEstadoPregunta),
                    // idEstadoPregunta: preguntaDto.idEstadoPregunta,
                    fechaPublicacion: now
                }
            });

            if(files.length > 0 ){
                const uploadImgs = files.map(async (file) => {
                    const imgUrl = await this.s3Service.uploadFile(file);
                    await this.prismaService.imgpregunta.create({
                        data: {
                            idPregunta: pregunta.idPregunta,
                            img: imgUrl
                        }
                    });
                });
    
                await Promise.all(uploadImgs);
            }

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
                    conocimiento: true,
                    materia_tutor: {
                        select: {
                            materia:true
                        }
                    }
                }
            });
    
            return user;
        } catch (error) {
            throw new BadRequestException("Error a obtener perfil tutor: " + error);
        }
    }

    // Método para obtener preguntas de un pupilo
    async obtenerPreguntasPupilo(idPupilo: number) {
        return this.obtenerPreguntas({ 
            idUsuarioPupilo: idPupilo, 
            idEstadoPregunta: 1
        });
    }
    
    // Método para obtener preguntas de interés para el tutor
    async obtenerPreguntasInteresTutor(idTutor: number) {
        return this.obtenerPreguntas({
            materia: {
                materia_tutor: { some: { idUsuario: idTutor } }
            },
            idEstadoPregunta: 1
        }, idTutor);
    }

    // Obtener preguntas aceptadas de usuario
    async obtenerPreguntasOfertaAceptada(idUsuario: number, idRol: number){
        if(idRol == 1) {
            return this.obtenerPreguntas({
                idEstadoPregunta: 2,
                ofertaresolucion: {
                    some: {
                        idUsuarioTutor: idUsuario,
                        idEstadoOferta: 3
                    }
                }
            },idUsuario);
        } 
        else if (idRol == 2){
            return this.obtenerPreguntas({
                idUsuarioPupilo: idUsuario,
                idEstadoPregunta: 2,
            },null,idRol)
        }
    }

    // obtener preguntas general
    async obtenerPreguntas(where: any, idTutor?: number, idRol?: number){
        try {
            const preguntas = await this.prismaService.pregunta.findMany({
                where,
                select:{
                    ...preguntaSelect,
                    ...(idTutor && {ofertaresolucion:{
                        where: {idUsuarioTutor: idTutor},
                        select: preguntaSelect.ofertaresolucion.select
                    }}),
                    ...(idRol && {ofertaresolucion:{
                        where: {idEstadoOferta: 3},
                        select: preguntaSelect.ofertaresolucion.select
                    }})
                },
                orderBy: {fechaPublicacion: "desc"}
            });

            return preguntas;
        } catch (error) {
            throw new BadRequestException(`Error al obtener las preguntas: ${error}`);
        }
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
                throw new ConflictException("Ya se envió una oferta para esta pregunta");
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
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException("Ocurrió un error al enviar la oferta");
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

    async acceptOfferQuestion(aceptarOfertaDto: AceptarOfertaDto){
        const { idOferta } = aceptarOfertaDto;

        try {
            const updatedOfferState = await this.prismaService.ofertaresolucion.update({
                where: {
                    idOferta: idOferta
                },
                data: {
                    idEstadoOferta: 3
                }
            });

            if(!updatedOfferState){
                throw new BadRequestException("La oferta no existe");
            }

            const updatedQuestionState = await this.prismaService.pregunta.update({
                where: {
                    idPregunta: updatedOfferState.idPregunta
                },
                data: {
                    idEstadoPregunta: 2
                }
            });
            
            return updatedQuestionState;
        } catch (error) {
            throw new BadRequestException(`Error al actualizar el estado de la pregunta: ${error}`);
        }
    }

    async updateProfilePhoto(idUsuario: number, file: Express.Multer.File){
        try {
            const newUserImg = await this.s3Service.uploadFile(file);

            const updateImgUser = this.prismaService.usuario.update({
                where: {
                    idUsuario: idUsuario,
                },
                data:{
                    fotoPerfil: newUserImg,
                }
            });

            if(updateImgUser){
                return updateImgUser;
            }

        } catch (error) {
            throw new BadRequestException(`Error al actualizar la imagen ${error}` );
        }   
    }
}
