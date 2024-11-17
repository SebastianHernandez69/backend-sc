import { IsNumber, IsString } from "class-validator";

export class CreateAdminDto {
    primerNombre: string;

    segundoNombre?: string;

    primerApellido: string;

    segundoApellido?: string;
    
    contrasenia: string;

    correo: string;
}