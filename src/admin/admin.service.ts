import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {

    constructor(private readonly prismaService: PrismaService){}

    async getUsers(idRol?: number){
        const users = await this.prismaService.usuario.findMany({
            where: idRol ? {idRol: idRol} : undefined,
            select: {
                idUsuario: true,
                nombre: true,
                rol: true,
                correo: true,
                dni: true,
                telefono: true,
                valoracion: true,
                fotoPerfil: true,
                horarioDisponibleFin: true,
                horarioDisponibleInicio: true,
                isenabled: true
            }
        })

        return users;
    }

    async changeUserState(idUsuario: number){

        try {
            const userState = await this.prismaService.usuario.findUnique({
                where: {idUsuario},
                select: {
                    isenabled: true
                }
            });
    
            if (!userState) {
                throw new Error('Usuario no encontrado');
            }
    
            const state = userState.isenabled;
    
            const updateStateUser = await this.prismaService.usuario.update({
                where: {idUsuario},
                data: { 
                    isenabled: !state
                }
            })

            return {message: "Estado del usuario actualizado con exito"}
        } catch (error) {
            throw new BadRequestException(`Error al cambiar estado del usuario: ${error}`);
        }
    }
}
