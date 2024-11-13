import { IsNumber, IsString } from "class-validator";

export class MateriaDto{

    idCategoria: string;
    
    @IsString()
    materia: string;
}