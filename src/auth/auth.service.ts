import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { encrypt } from 'src/libs/bcrypt';
import { compare } from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-pass.dto';

@Injectable()
export class AuthService {

    constructor(private prismaService: PrismaService){}

    // Servicio para iniciar sesion
    async login(loginUserDto: LoginUserDto){

        const correo = loginUserDto.correo;
        const password = loginUserDto.password;

        try {
            
            const user = await this.prismaService.usuarios.findUnique({
                where: {
                    correo
                }
            });

            if(!user){
                throw new BadRequestException('Correo o contraseña invalidos');
            }

            const isPassMatch = await compare(password, user.contrasenia);

            if(!isPassMatch){
                throw new BadRequestException('Correo o contraseña invalidos');
            }

            return { 'idUsuario': user.id };

        } catch (error) {
            throw new BadRequestException(error.message || 'Error al intentar iniciar sesión');
        }
    }

    async getAllUsers(){
        return await this.prismaService.usuarios.findMany();
    }

    // Servicio para registrar un usuario
    async signUp(registerUserDto: RegisterUserDto){

        try {

            const correo = registerUserDto.correo;

            const emailFound = await this.prismaService.usuarios.findUnique({
                where: {
                    correo
                }
            });

            if(emailFound) throw new BadRequestException("El correo ya esta en uso");

            //  GUARDAR NOMBRES DEL USUARIO
            const name = await this.prismaService.nombres.create({
                data: {
                    primernombre: registerUserDto.primerNombre,
                    segundonombre: registerUserDto.segundoNombre,
                    primerapellido: registerUserDto.primerApellido,
                    segundoapellido: registerUserDto.segundoApellido   
                }
            });

            const horaInicio = new Date(`2000-01-01T${registerUserDto.horarioDiponibleInicio}Z`);
            const horaFin = new Date(`2000-01-01T${registerUserDto.horarioDisponibleFin}Z`);

            // HASH
            const hashPass = await encrypt(registerUserDto.contrasenia);

            // DATOS DE USUARIO
            const user = await this.prismaService.usuarios.create({
                data: {
                idrol: registerUserDto.idRol,
                idnombre: name.idnombre,
                edad: registerUserDto.edad,
                contrasenia: hashPass,
                correo: correo,
                dni: registerUserDto.dni,
                valoracion: registerUserDto.valoracion,
                foto_perfil: registerUserDto.foto_Perfil,
                horariodiponibleinicio: horaInicio.toISOString(),
                horariodisponiblefin: horaFin.toISOString()
                },
            });

            const { contrasenia: _, ...userPassless } = user;


            return userPassless;

        } catch (error) {
            if(error instanceof BadRequestException) {
                throw error;
            }
            throw new Error(error);
        }

    }

    // Servicio para cambiar contrasena
    async updatePassword(id: number, updatePassword: UpdatePasswordDto){
        try {
            
            const { oldPassword, newPassword } = updatePassword;

            const user = await this.prismaService.usuarios.findUnique({
                where:{
                    id
                }
            });

            const isPassMatch = await compare(oldPassword, user.contrasenia);

            if(!isPassMatch){
                throw new BadRequestException('Contraseña antigua no coincide');
            }

            const newHashPassword = await encrypt(newPassword);

            // Actualizar contrasena
            await this.prismaService.usuarios.update({
                where: { id },
                data: { contrasenia: newHashPassword }
            });

            return { message: 'Contraseña actualizada correctamente' }

        } catch (error) {
            throw new BadRequestException(error.message || 'Error al cambiar contraseña');
        }
        
    }

}
