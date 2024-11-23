import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StreamChat } from 'stream-chat';

@Injectable()
export class StreamchatService {
    private readonly client: StreamChat;

    constructor(private readonly configService: ConfigService){
        
        this.client = StreamChat.getInstance(
            this.configService.get('STREAMCHAT_KEY'),
            this.configService.get('STREAMCHAT_SECRET')
        );
    }

    async createUser(userId: string, name: string, profilePhoto: string){
        try {
            const user = await this.client.upsertUser({
                id: userId,
                name,
                image: profilePhoto
            });
    
            if(!user){
                throw new BadRequestException("error al crear usuario en streamchat")
            }
        } catch (error) {
            throw new BadRequestException(`Error al crear usuario: ${error}`);
        }
    }

    // TOKEN STREAMCHAT
    async generateToken(userId: string){
        try {
            const token = this.client.createToken(
                userId
            );

            if(!token){
                throw new BadRequestException("Error al crear token streamchat");
            }

            return token;
        } catch (error) {
            throw new BadRequestException("Error al crear token streamchat: ", error);
        }
    }

    //
    async createPrivateChannel(userId1: string, userId2: string){
        try {
            const filter = {
                type: 'messaging',
                members: { $in: [userId1, userId2] }, // Consulta todos los canales donde al menos uno está presente
            };
            
            const newChannel = this.client.channel('messaging',`${userId1}_${userId2}_chat`,{
                members: [userId1, userId2],
                isPrivate: true,
                created_by: { id: userId1 },
            })

            await newChannel.create();

            return {
                id: newChannel.id,
            };

        } catch (error) {
            throw new BadRequestException(`Error al crear chat: ${error}`);
        }
    }

    //
    async updateProfilePhoto(userId: string, newProfilePhoto: string){

        const update = {
            id: userId,
            set: {
                image: newProfilePhoto
            }
        }

        try {
            const res = await this.client.partialUpdateUser(update);
            if(!res){
                throw new Error(`Error al actualizar foto`);
            }

        } catch (error) {
            throw new Error(`Error al actualizar la foto de streamchat: ${error}`);
        }
    }
}
