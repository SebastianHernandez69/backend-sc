import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HomeService {

    constructor (private prismaService: PrismaService){};

    async constGetHomeUser(id: number){
        const idN = await this.prismaService.usuarios.findUnique({
           where: {id},
            select: {
                idnombre: true,
            }
        });

        const idnombre = idN.idnombre;

        const nombres = await this.prismaService.nombres.findUnique({
            where: {idnombre},
            select: {
                primernombre: true,
                segundonombre: true,
                primerapellido: true,
                segundoapellido: true
            }
        });

        return nombres;
    }



}
