import { IsString } from "class-validator";

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
    contrasenia: string;
    correo: string;
    dni: string;
    valoracion: number;
    foto_Perfil?: Buffer;
    horarioDiponibleInicio: string;
    horarioDisponibleFin: string;
  }
  