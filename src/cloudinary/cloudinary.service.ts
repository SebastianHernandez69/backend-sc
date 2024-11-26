import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {

    constructor(private readonly configService: ConfigService){
        cloudinary.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET')
        });
    }

    async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {folder: folder},
                (err, result) => {
                    if(err) {
                        reject(err);
                    }else {
                        resolve(result.secure_url);
                    }
                }
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        })
    }
}
