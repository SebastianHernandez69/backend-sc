import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInstitucionDto } from './dto/create-intitucion.dto';
import { CreatePuestoDto } from './dto/create-puesto.dto';

@Injectable()
export class ExperienceService {
    constructor(private readonly prismaService: PrismaService){}

    // Get instituciones
    async getAllInstituciones(){
        try {
            const instituciones = await this.prismaService.institucion.findMany();

            return instituciones;
        } catch (error) {
            throw new BadRequestException(`Error al obtener las instituciones: ${error}`);
        }
    }

    // Create instituciones
    async createInstitucion(createInstitucionDto: CreateInstitucionDto){
        try {
            const { institucion } = createInstitucionDto;
    
            const newInstitucion = await this.prismaService.institucion.create({
                data:{
                    institucion
                }
            });
    
            if(!newInstitucion){
                throw new BadRequestException(`Error al crear la institucion`);
            }

            return newInstitucion;
        } catch (error) {
            throw new BadRequestException(`Error al crear la institucion: ${error}`);
        }
    }

    // get puestos
    async getPuestos(){
        try {
            const puestos = await this.prismaService.puesto.findMany();

            return puestos;
        } catch (error) {
            throw new BadRequestException(`Error al obtener puestos: ${error}`);
        }
    }

    // Create puesto
    async createPuesto(createPuestoDto: CreatePuestoDto){
        const { puesto } = createPuestoDto;
        try {
            const newPuesto = await this.prismaService.puesto.create({
                data:{
                    puesto
                }
            });

            if(!newPuesto){
                throw new BadRequestException(`Error al crear el puesto`);
            }

            return newPuesto;
        } catch (error) {
            throw new BadRequestException(`Error al crear el puesto: ${error}`);
        }
    }

    // get experience 
    async getExperienciaIdUsuario(idUsuario: number){
        try {
            const experience = await this.prismaService.experiencia.findMany({
                where: {
                    idUsuario
                },
                include: {
                    puesto: {
                        select: {
                            puesto: true
                        }
                    }
                }
            });

            if(!experience){
                return experience;
            }

            const experienceFormat = experience.map((e) => ({
                idExperiencia: e.idExperiencia,
                puesto: e.puesto.puesto,
                empresa: e.empresa,
                fechaInicio: e.fechaInicio,
                fechaFin: e.fechaFin,
                descripcion: e.descripcion
            }));

            return experienceFormat;
        } catch (error) {
            throw new BadRequestException(`Error al obtener la experiencia del usuario: ${error}`);
        }
    }

    // get conocimiento by userId
    async getConocimientoIdUsuario(idUsuario: number){
        try {
            const conocimientos = await this.prismaService.conocimiento.findMany({
                where: {
                    idUsuario
                },
                include: {
                    institucion: {
                        select: {
                            institucion: true
                        }
                    }
                }
            });

            if(!conocimientos){
                return conocimientos;
            }

            const conocimientoFormat = conocimientos.map((c) => ({
                idConocimiento: c.idConocimiento,
                institucion: c.institucion.institucion,
                tituloAcademico: c.tituloAcademico,
                fechaEgreso: c.fechaEgreso
            }));

            return conocimientoFormat;
        } catch (error) {
            throw new BadRequestException(`Error al obtener los conocimientos del usuario: ${error}`);
        }
    }
}
