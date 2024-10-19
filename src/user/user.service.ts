import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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

}
