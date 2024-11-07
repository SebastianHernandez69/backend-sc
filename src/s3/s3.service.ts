import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import {v4 as uuid} from 'uuid';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucketName: string; 

    constructor(private readonly configService: ConfigService){
        this.s3Client = new S3Client({
            region: this.configService.get('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
            },
        });
        this.bucketName = this.configService.get('S3_BUCKET_NAME');
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const fileKey = `${uuid()}-${file.originalname}`;

        await this.s3Client.send(
            new PutObjectCommand({
              Bucket: this.bucketName,
              Key: fileKey,
              Body: file.buffer,
              ContentType: file.mimetype
            })
        );

        await this.s3Client.send(
        new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype
            })
        );
        // agregar carpeta en s3
        return `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${fileKey}`
    }

}
