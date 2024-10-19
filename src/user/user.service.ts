import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PreguntaDto } from './dto/pregunta.dto';
import { format } from 'date-fns';

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

    
}
