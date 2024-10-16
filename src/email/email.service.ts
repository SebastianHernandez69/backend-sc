import { Injectable } from '@nestjs/common';
import * as sgEmail from '@sendgrid/mail';

@Injectable()
export class EmailService {
    constructor(){
        sgEmail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    async sendVerificationEmail(email: string, code: string){
        const msg = {
            to: email,
            from: 'sharkcat.info@gmail.com',
            subject: 'Verificación de correo electrónico',
            text: `Tu código de verificación es: ${code}`,
            html: `<p>Tu código de verificación es:</p><strong>${code}</strong>`,
        }

        try{
            await sgEmail.send(msg);
            console.log("Correo enviado exitosamente");
        }catch(error){
            console.log(`Error al enviar correo: ${error}`);
        }
    }

    async sendResetPassEmail(email: string, code: string){
        const msg = {
            to: email,
            from: 'sharkcat.info@gmail.com',
            subject: 'Codigo de recuperacion de contraseña',
            text: `Tu codigo de recuperacion es: ${code}`,
            html: `<p>Tu codigo de recuperacion es:</p><strong>${code}</strong>`,
        }

        try{
            await sgEmail.send(msg);
            console.log("Correo de recuperacion enviado");
        } catch(error) {
            console.log(`Error al enviar correo: ${error}`);
        }
    }

}
