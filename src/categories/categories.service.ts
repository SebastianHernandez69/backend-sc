import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {

    constructor(private prismaService: PrismaService){
    }
    //CATEGORIAS
    //Obtener categorias
    async getCategories(){
        return await this.prismaService.categoria.findMany();
        
    }

    //MATERIAS
    async getMatByCategory(idCategoriaP: number){
        return await this.prismaService.materia.findMany({
            where: {
                idCategoria: idCategoriaP
            }
        });
    }
}
