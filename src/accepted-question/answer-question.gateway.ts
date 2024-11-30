import { 
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect, 
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';

  @WebSocketGateway({ cors: { origin: '*' } })
  export class AnswerQuestionGateway implements OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer()
    server: Server;

    private rooms: Map<string, Set<string>> = new Map();
    private userSocketMap: Map<number, string> = new Map();

    // Manejar conexión de un cliente
    handleConnection(client: Socket): void {
        // console.log(`Cliente conectado: ${client.id}`);
    }

    // Manejar desconexión de un cliente
    handleDisconnect(client: Socket): void {
        // console.log(`Cliente desconectado: ${client.id}`);

        // Limpiar userSocketMap
        for (const [idTutor, socketId] of this.userSocketMap.entries()) {
        if (socketId === client.id) {
            this.userSocketMap.delete(idTutor);
            console.log(`Tutor con ID ${idTutor} eliminado del registro`);
        }
        }

        // Limpiar las rooms
        for (const [idPregunta, clients] of this.rooms.entries()) {
        if (clients.has(client.id)) {
            clients.delete(client.id);
            console.log(`Cliente ${client.id} eliminado de la room ${idPregunta}`);

            // Si la room queda vacía, eliminarla
            if (clients.size === 0) {
            this.rooms.delete(idPregunta);
            console.log(`Room ${idPregunta} eliminada por estar vacía`);
            }
        }
        }
    }

    @SubscribeMessage('registerUser')
    handleRegisterUser(
    @MessageBody() data: { idUsuario: number },
    @ConnectedSocket() client: Socket,
    ): void {
        const { idUsuario } = data;

        // Verificar si el usuario ya está registrado
        if (this.userSocketMap.has(idUsuario)) {
            const oldSocketId = this.userSocketMap.get(idUsuario);

            // Si es el mismo socket, no registrar de nuevo
            if (oldSocketId === client.id) {
            console.log(`Usuario con ID ${idUsuario} ya registrado en el socket ${client.id}`);
            return;
            }

            // Si es un socket diferente, eliminar el antiguo
            console.log(`Reemplazando socket del usuario ${idUsuario}: ${oldSocketId} -> ${client.id}`);
            this.server.sockets.sockets.get(oldSocketId)?.disconnect();
        }

        // Asociar el nuevo socket ID al usuario
        this.userSocketMap.set(idUsuario, client.id);
        console.log(`Usuario registrado: ID usuario ${idUsuario}, ID socket ${client.id}`);
    }

    
    NotifyJoinRoom(idPregunta: number, idTutor: number, idPupilo: number): void {
        if(!this.rooms.has(String(idPregunta))){
            this.rooms.set(String(idPregunta), new Set());
        }

        const tutorSocketId = this.userSocketMap.get(idTutor);
        const pupiloSocketId = this.userSocketMap.get(idPupilo);

        if (tutorSocketId) {
            this.server.to(tutorSocketId).emit('joinRoomAnswerQuestion', { idPregunta });
            console.log(`Notificación enviada al tutor (ID socket: ${tutorSocketId}) para unirse a la room ${idPregunta}`);
        } else {
            console.log(`Tutor con ID ${idTutor} no está conectado`);
        }
        
        if (pupiloSocketId) {
            this.server.to(pupiloSocketId).emit('joinRoomAnswerQuestion', { idPregunta });
            console.log(`Notificación enviada al pupilo (ID socket: ${pupiloSocketId}) para unirse a la room ${idPregunta}`);
        } else {
            console.log(`Pupilo con ID ${idPupilo} no está conectado`);
        }
    }

    @SubscribeMessage('joinRoomAnswerQuestion')
    handleUserJoinRoom(
        @MessageBody() data: { idPregunta: number },
        @ConnectedSocket() client: Socket,
    ): void{
        const { idPregunta } = data;
        const roomName = String(idPregunta);

        // Crear la room si no existe
        if (!this.rooms.has(roomName)) {
            this.rooms.set(roomName, new Set());
            console.log(`Room ${roomName} creada`);
        }

        if (this.rooms.get(roomName).has(client.id)) {
            console.log(`Usuario ${client.id} ya está en la room ${roomName}`);
            return;
        }

        this.rooms.get(roomName).add(client.id);
        client.join(roomName);
        console.log(`Usuario ${client.id} se a unido a la room ${roomName}`);
    }

    // Notificación de pregunta contestada
    notifyQuestionAnswered(idPregunta: number, idTutor: number): void {
        this.server.to(String(idPregunta)).emit('questionAnswered', { idPregunta, idTutor });
        console.log(`Notificación enviada a room ${idPregunta}`);
    }
  }