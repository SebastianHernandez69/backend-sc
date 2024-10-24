import { IsNumber, IsString } from "class-validator";

export class UpdateUserDto{
    @IsString()
    primerNombre?: string;
    @IsString()
    segundoNombre?: string;
    @IsString()
    primerApellido?: string;
    @IsString()
    segundoApellido?: string;

    @IsNumber()
    edad?: number;

    @IsString()
    dni?: string;

    @IsString()
    telefono?: string;

    horarioDisponibleInicio?: string;
    horarioDisponibleFin?: string;

}