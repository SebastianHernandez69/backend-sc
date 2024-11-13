import { IsString } from "class-validator";

export class CategoriaDto{
    @IsString()
    categoria: string;
}