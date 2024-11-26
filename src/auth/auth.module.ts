import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailService } from 'src/email/email.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { S3Module } from 'src/s3/s3.module';
import { StreamchatModule } from 'src/streamchat/streamchat.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  providers: [AuthService,EmailService,LocalStrategy,JwtStrategy],
  controllers: [AuthController],
  imports: [
      PassportModule,
      ConfigModule.forRoot({ isGlobal: true }), 
      PrismaModule,
      S3Module,
      StreamchatModule,
      CloudinaryModule,
      JwtModule.registerAsync({
        imports: [ConfigModule], 
        inject: [ConfigService], 
        useFactory: (configService: ConfigService) => ({
          secret: configService.get<string>('SECRET'), 
          signOptions: { expiresIn: '1h' },
        }),
      }),
    ],
  })
export class AuthModule {}
