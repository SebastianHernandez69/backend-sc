import { IsNumber, isNumber, isString, IsString } from "class-validator";

export class RegisterUserDto {
    @IsString()
    primerNombre: string;
    @IsString()
    segundoNombre?: string;
    @IsString()
    primerApellido: string;
    @IsString()
    segundoApellido?: string;
  
    idRol: string | null;
    
    edad: string;
    @IsString()
    contrasenia: string;
    confirmarContrasenia: string;
    @IsString()
    correo: string;
    @IsString()
    dni: string;
    @IsString()
    telefono: string;
    @IsNumber()

    horarioDiponibleInicio?: string;
    
    horarioDisponibleFin?: string;
  }
  