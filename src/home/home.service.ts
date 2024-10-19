import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HomeService {

    constructor (private prismaService: PrismaService){};

    async constGetHomeUser(id: number){
        const idN = await this.prismaService.usuario.findUnique({
           where: {idUsuario: id},
            select: {
                idNombre: true,
            }
        });

        const idNombre = idN.idNombre;

        const nombres = await this.prismaService.nombre.findUnique({
            where: {idNombre},
            select: {
                primerNombre: true,
                segundoNombre: true,
                primerApellido: true,
                segundoApellido: true
            }
        });

        return nombres;
    }

}
