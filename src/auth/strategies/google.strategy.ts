import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "../auth.service";
import { ConfigService } from "@nestjs/config";
import { first } from "rxjs";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google'){
    constructor(private authService: AuthService, private configService: ConfigService){
        super({
            clientId: configService.get('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
            callbackURL: 'http://localhost:3000',
            scope:['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails, photos } = profile;
        const user = await this.authService.validateGoogleUser(emails[0].value, name, photos[0].value);
        done(null, user);
        
    }
}