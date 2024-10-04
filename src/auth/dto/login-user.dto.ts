import { IsEmail } from "class-validator";

export class LoginUserDto{
    @IsEmail()
    correo: string

    password: string
}