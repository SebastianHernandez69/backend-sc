import { Body, Controller, Get, Param, Patch, Post, HttpCode  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-pass.dto';
import { ResetPasswordDto } from './dto/reset-pass.dto';

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
    signup(@Body() registerUserDto: RegisterUserDto){
        return this.authService.signUp(registerUserDto);
    }

    @Patch('/pass-update/:id')
    updatePassword(@Param('id') id: string, @Body() updatePasswordDto: UpdatePasswordDto){
        return this.authService.updatePassword(parseInt(id), updatePasswordDto)
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
