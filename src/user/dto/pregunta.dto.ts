import { IsNumber, IsString } from "class-validator";

export class PreguntaDto {
    @IsNumber()
    idMateria: string;
    @IsString()
    titulo: string;
    @IsString()
    descripcion: string;
    @IsNumber()
    idEstadoPregunta: string;
}