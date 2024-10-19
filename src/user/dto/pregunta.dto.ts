import { IsNumber, IsString } from "class-validator";

export class PreguntaDto {
    @IsNumber()
    idMateria: number;
    @IsString()
    titulo: string;
    @IsString()
    descripcion: string;
    @IsNumber()
    idEstadoPregunta: number;
}