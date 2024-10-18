import { IsNumber, isNumber, isString, IsString } from "class-validator";

export class RegisterUserDto {
    @IsString()
    primerNombre: string;
    @IsString()
    segundoNombre: string;
    @IsString()
    primerApellido: string;
    @IsString()
    segundoApellido: string;
  
    idRol: number | null;
    
    edad: number;
    @IsString()
    contrasenia: string;
    @IsString()
    correo: string;
    @IsString()
    dni: string;
    @IsString()
    telefono: string;
    @IsNumber()
    valoracion: number;

    foto_Perfil?: string;

    horarioDiponibleInicio: string;
    
    horarioDisponibleFin: string;
  }
  