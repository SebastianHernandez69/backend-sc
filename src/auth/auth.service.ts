import { applyDecorators, BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { encrypt } from 'src/libs/bcrypt';
import { compare } from 'bcrypt';
import * as crypto from 'crypto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-pass.dto';
import { addMinutes, sub } from 'date-fns';
import { EmailService } from 'src/email/email.service';
import { ResetPasswordDto } from './dto/reset-pass.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/interfaces/user';
import { S3Service } from 'src/s3/s3.service';
import { StreamchatService } from 'src/streamchat/streamchat.service';
import { CreateAdminDto } from './dto/create-admin.dto';


@Injectable()
export class AuthService {

    constructor(private prismaService: PrismaService, private emailService: EmailService,
        private jwtService: JwtService,
        private readonly s3Service: S3Service,
        private readonly streamchatService: StreamchatService
    ){}

    //
    async validateGoogleUser(email: string, name: any, fotoPerfil: string){
        try{
            let user = await this.prismaService.usuario.findUnique({
                where: {
                    correo: email
                }
            });
    
            if(!user){
                const { givenName: primerNombre, familyName: primerApellido } = name;
    
                const newName = await this.prismaService.nombre.create({
                    data: {
                        primerApellido,
                        primerNombre,
                        segundoNombre:'',
                        segundoApellido: ''
                    }
                });
    
                user = await this.prismaService.usuario.create({
                    data:{
                        idRol: 1,
                        dni: '1010',
                        idNombre: newName.idNombre,
                        correo: email,
                        contrasenia: '',
                        telefono: '90909090',
                        edad: 20,
                        valoracion: null,
                        fotoPerfil: fotoPerfil,
                        isverified: true,
                        horarioDisponibleFin: null,
                        horarioDisponibleInicio: null,
                        verificationcode: null,
                        verificationexpiry: null
                    }
                });
            } else{
                const payload = {
                    sub: user.idUsuario,
                    username: user.idNombre,
                    rol: user.idRol
                };
    
                const access_token = await this.jwtService.signAsync(payload);
    
                return {access_token};
            }
        }catch(error){
            throw new BadRequestException("Error en registro/login de google"+error);
        }
    }


    // Servicio para iniciar sesion
    async login(loginUserDto: LoginUserDto) {
        const { correo, password } = loginUserDto;
    
        try {
            let user: User = await this.findAdmin(correo);
            let isAdmin = !!user;
    
            if (!user) {
                user = await this.prismaService.usuario.findUnique({ where: { correo } });
                isAdmin = false;
            }
    
            if (!user) {
                throw new BadRequestException('Correo o contraseña inválidos');
            }
    
            const isPassMatch = await compare(password, user.contrasenia);
            if (!isPassMatch) {
                throw new BadRequestException('Correo o contraseña inválidos');
            }

            let scToken: string | null;
            // Generar token de streamchat
            if(!isAdmin){
                scToken = await this.streamchatService.generateToken(user.idUsuario.toString());
            }

            const payload = isAdmin
                ? { sub: user.idAdmin, username: user.idNombre, rol: 3 }
                : { sub: user.idUsuario, username: user.idNombre, rol: user.idRol, profilePhoto: user.fotoPerfil, scToken: scToken};
    
            const access_token = await this.jwtService.signAsync(payload);
            return { access_token };
        } catch (error) {
            console.error(error);
            throw new BadRequestException(error.message || 'Error al intentar iniciar sesión');
        }
    }
    
    
    async findAdmin(correo: string){
        try {
            const adminUser = await this.prismaService.admin.findUnique({
                where: { correo: correo }
            });
            return adminUser;

        } catch (error) {
            console.log(`Error al obtener admin ${error}`);
            return null;
        }
    }

    async getAllUsers(){
        return await this.prismaService.usuario.findMany();
    }

    // Servicio para registrar un usuario
    async signUp(registerUserDto: RegisterUserDto, file?: Express.Multer.File) {
        try {
            const { correo, contrasenia, idRol, primerNombre, segundoNombre, primerApellido, segundoApellido, edad, dni, telefono } = registerUserDto;
    
            const emailFound = await this.prismaService.usuario.findUnique({ where: { correo } });
            if (emailFound) throw new BadRequestException("El correo ya está en uso");
    
            const name = await this.prismaService.nombre.create({
                data: { primerNombre, segundoNombre, primerApellido, segundoApellido }
            });
    
            const defaultTime = new Date(`1970-01-01T00:00:00.000Z`).toISOString();
    
            const hashPass = await encrypt(contrasenia);
    
            const verificationCode = this.generateVerificationCode();
            const verificationExpiry = addMinutes(new Date(), 15).toISOString();
    
            const userProfilePhoto = file
                ? await this.s3Service.uploadFile(file, "profiles-img")
                : "https://sharkcat-bucket.s3.us-east-2.amazonaws.com/profiles-img/defaul-user-profile.png";
    
            const user = await this.prismaService.usuario.create({
                data: {
                    idRol: parseInt(idRol),
                    idNombre: name.idNombre,
                    edad,
                    contrasenia: hashPass,
                    correo,
                    dni,
                    valoracion: 5,
                    fotoPerfil: userProfilePhoto,
                    telefono,
                    horarioDisponibleInicio: defaultTime,
                    horarioDisponibleFin: defaultTime,
                    isverified: false,
                    verificationcode: verificationCode,
                    verificationexpiry: verificationExpiry
                },
            });
    
            await this.streamchatService.createUser(
                user.idUsuario.toString(),
                `${name.primerNombre} ${name.primerApellido}`,
                user.fotoPerfil
            );
    
            await this.emailService.sendVerificationEmail(correo, verificationCode);
    
            const { contrasenia: _, ...userPassless } = user;
            return userPassless;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new Error(error);
        }
    }
    
    // Create admin user
    async createAdmin(createAdminDto: CreateAdminDto){
        try {

            const emailFound = await this.prismaService.admin.findUnique({
                where:{
                    correo: createAdminDto.correo
                }
            })

            if(emailFound){
                throw new BadRequestException("El correo ya esta en uso");
            }

            const name = await this.prismaService.nombre.create({
                data: {
                    primerNombre: createAdminDto.primerNombre,
                    segundoNombre: createAdminDto.segundoNombre,
                    primerApellido: createAdminDto.primerApellido,
                    segundoApellido: createAdminDto.segundoApellido   
                }
            });

            // HASH
            const hashPass = await encrypt(createAdminDto.contrasenia);

            const admin = await this.prismaService.admin.create({
                data:{
                    correo: createAdminDto.correo,
                    contrasenia: hashPass,
                    idNombre: name.idNombre
                }
            });

            const {contrasenia: _, ...adminPassless} = admin;

            return adminPassless;

        } catch (error) {
            throw new BadRequestException(`Error al crear admin: ${error}`);
        }
    }


    // change password
    async updatePassword(id: number, updatePassword: UpdatePasswordDto){
        try {
            
            const { oldPassword, newPassword } = updatePassword;

            const user = await this.prismaService.usuario.findUnique({
                where:{
                    idUsuario: id
                }
            });

            const isPassMatch = await compare(oldPassword, user.contrasenia);

            if(!isPassMatch){
                throw new BadRequestException('Contraseña antigua no coincide');
            }

            const newHashPassword = await encrypt(newPassword);

            // Update password
            await this.prismaService.usuario.update({
                where: { idUsuario: id },
                data: { contrasenia: newHashPassword }
            });

            return { message: 'Contraseña actualizada correctamente' }

        } catch (error) {
            throw new BadRequestException(error.message || 'Error al cambiar contraseña');
        }
        
    }

    async verifyEmail(code: string): Promise<{ message: string }>{
        
        const user = await this.validateVerificationCode(code);

        // 
        await this.prismaService.usuario.update({
            where: {idUsuario: user.idUsuario},
            data: {
                isverified: true,
                verificationcode: null,
                verificationexpiry: null
            },
        });

        return { message: 'Usuario verificado con exito' }
    }

    // Request password reset code
    async requestPasswordReset(correo: string): Promise<void>{
        const user = await this.prismaService.usuario.findUnique({
            where: {correo}
        });

        if(!user){
            throw new BadRequestException('Usuario no encontrado');
        }

        const verificationCode = this.generateVerificationCode();
        const verificationExpiry = addMinutes(new Date(), 15);

        await this.prismaService.usuario.update({
            where:{
                idUsuario: user.idUsuario
            },
            data:{
                verificationcode: verificationCode,
                verificationexpiry: verificationExpiry
            }
        });

        await this.emailService.sendResetPassEmail(correo, verificationCode);
        
    }

    // Reset pass
    async resetPassword(resetPasswordDto: ResetPasswordDto){
        const { code, newPassword } = resetPasswordDto;

        const user = await this.validateVerificationCode(code);

        const newHashPassword = await encrypt(newPassword);

        await this.prismaService.usuario.update({
            where: {idUsuario: user.idUsuario},
            data: {
                contrasenia: newHashPassword,
                verificationcode: null,
                verificationexpiry: null
            }
        });
    }

    // Generate random code
  private generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Validate verification code
  private async validateVerificationCode(code: string){
    const user = await this.prismaService.usuario.findFirst({
        where: {verificationcode: code}
    });

    if(!user){
        throw new BadRequestException('Codigo de verificacion invalido');
    }
    if(new Date() > user.verificationexpiry){
        throw new BadRequestException('Codigo de verificacion expirado');
    }

    return user;
  }

}
