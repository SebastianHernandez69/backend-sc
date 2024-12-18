import { Body, Controller, Get, Param, Patch, Post, HttpCode, UseGuards, Req, UseInterceptors, UploadedFile  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-pass.dto';
import { ResetPasswordDto } from './dto/reset-pass.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Request } from 'express';
import { JwtPayload } from 'src/interfaces/JwtPayload';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService){}

    @Post('/log-in') 
    @HttpCode(200)
    login(@Body() loginUserDto: LoginUserDto){
        return this.authService.login(loginUserDto);
    }

    @Post('/sign-up')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('file'))
    signup(@Body() registerUserDto: RegisterUserDto,@UploadedFile() file?: Express.Multer.File){
        return this.authService.signUp(registerUserDto,file || null);
    }

    @Post('/create-admin')
    @HttpCode(200)
    async createAdmin(@Body() createAdminDto: CreateAdminDto){
        return await this.authService.createAdmin(createAdminDto);
    }

    @Patch('/pass-update')
    @UseGuards(JwtAuthGuard)
    updatePassword(@Req() req: Request, @Body() updatePasswordDto: UpdatePasswordDto){
        const user = req.user as JwtPayload;
        return this.authService.updatePassword(user.sub, updatePasswordDto)
    }

    @Post('/sign-up/verify')
    @HttpCode(200)
    verifyUser(@Body('code') code: string){
        return this.authService.verifyEmail(code);
    }

    @Post('/req-reset-password')
    @HttpCode(200)
    async requestPasswordReset(@Body('correo') correo: string){
        await this.authService.requestPasswordReset(correo);
        return {message: "Correo de recuperacion de contraseña enviado"}
    }

    @Post('/reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto){
        await this.authService.resetPassword(resetPasswordDto);
        return {message: "Contraseña actualizada correctamente"}
    }
}
