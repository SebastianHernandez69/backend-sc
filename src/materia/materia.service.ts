import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriaDto } from './dto/categoria-dto';
import { S3Service } from 'src/s3/s3.service';
import { MateriaDto } from './dto/materia-dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class MateriaService {
    constructor(
        private prismaService: PrismaService, 
        private readonly s3Service: S3Service,
        private readonly cloudinaryService: CloudinaryService
    ){

    }

    // Add new category
    async addNewCategory(categoriaDto: CategoriaDto, file?: Express.Multer.File){

        try {

            let urlImgCategory: string | null = null;

            if(file){
                // Upload category img and get link
                urlImgCategory = await this.cloudinaryService.uploadFile(file, "categorias");
                // urlImgCategory = await this.s3Service.uploadFile(file,"categorias");
            }

            const newCategory = await this.prismaService.categoria.create({
                data: {
                    categoria: categoriaDto.categoria,
                    imgCategoria: urlImgCategory
                }
            });

            return newCategory;
        } catch (error) {
            throw new BadRequestException(`Error al crear la categoria ${error.message}`);
        }

    }

    // Add new materia to category
    async addNewMateria(materiaDto: MateriaDto, file?: Express.Multer.File){
        try {
            let urlImgMateria: string | null = null;

            if(file){
                urlImgMateria = await this.cloudinaryService.uploadFile(file, "materias");
                // urlImgMateria = await this.s3Service.uploadFile(file, "materias");
            }

            const newMateria = await this.prismaService.materia.create({
                data: {
                    idCategoria: parseInt(materiaDto.idCategoria),
                    materia: materiaDto.materia,
                    imgMateria: urlImgMateria
                }
            });

            return newMateria;
        } catch (error) {
            throw new BadRequestException(`Error al crear la materia para la categoria: ${materiaDto.idCategoria}, error: ${error.message}`);
        }
    }

    // Get 
    async getMateriaInteresTutor(IdTutor: number){
        try {
            const materias = await this.prismaService.materia_tutor.findMany({
                where: {
                    idUsuario: IdTutor
                },
                select:{
                    materia: {
                        select: {
                            idMateria: true,
                            materia: true
                        }
                    }
                }
            });

            const materiaFormat = materias.map((m) => ({
                idMateria: m.materia.idMateria,
                materia: m.materia.materia
            }))

            return materiaFormat;
        } catch (error) {
            throw new BadRequestException(`Error al obtener las materias del tutor: ${error}`);
        }
    }

    // delete
    async removeMateriaInteresTutor(idTutor: number, idMateria: number){
        try {
            const materias = await this.prismaService.materia_tutor.deleteMany({
                where:{
                    idMateria,
                    idUsuario: idTutor
                }
            });
    
            return {message: "Materia eliminada con exito"}
            
        } catch (error) {
            throw new BadRequestException(`Error al eliminar la materia`);
        }
    }
}
