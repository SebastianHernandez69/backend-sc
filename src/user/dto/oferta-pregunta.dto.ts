import { IsNumber, IsString } from "class-validator";

export class OfertaPreguntaDto{
    @IsNumber()
    idPregunta: number

    @IsString()
    descripcion: string
}