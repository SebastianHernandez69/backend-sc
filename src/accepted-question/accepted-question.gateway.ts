import { 
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket, 
  OnGatewayDisconnect,
  OnGatewayConnection 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class AcceptedQuestionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, Set<string>> = new Map(); // Rooms y sus sockets
  private userSocketMap: Map<number, string> = new Map(); // Mapa de usuario a socket ID

  // Manejar conexión de un cliente
  handleConnection(client: Socket): void {
    console.log(`Cliente conectado: ${client.id}`);
  }

  // Manejar desconexión de un cliente
  handleDisconnect(client: Socket): void {
    console.log(`Cliente desconectado: ${client.id}`);

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

  // Registrar al tutor en el servidor
  @SubscribeMessage('registerTutor')
  handleRegisterTutor(
    @MessageBody() data: { idTutor: number },
    @ConnectedSocket() client: Socket,
  ): void {
    const { idTutor } = data;

    // Asociar ID del tutor con ID del socket
    this.userSocketMap.set(idTutor, client.id);
    console.log(`Tutor registrado: ID usuario ${idTutor}, ID socket ${client.id}`);
  }

  // Pupilo se une a una room y notifica al tutor
  @SubscribeMessage('joinRoomAcceptedOffer')
  handleJoinRoom(
    @MessageBody() data: { idPregunta: number; idTutor: number },
    @ConnectedSocket() client: Socket,
  ): void {
    const { idPregunta, idTutor } = data;

    // Crear o agregar al pupilo en la room
    if (!this.rooms.has(String(idPregunta))) {
      this.rooms.set(String(idPregunta), new Set());
    }

    this.rooms.get(String(idPregunta)).add(client.id);
    client.join(String(idPregunta));
    console.log(`Pupilo (${client.id}) unido a la room ${idPregunta}`);

    // Buscar al tutor por su ID
    const tutorSocketId = this.userSocketMap.get(idTutor);
    if (tutorSocketId) {
      this.server.to(tutorSocketId).emit('joinRoomAsTutor', { idPregunta });
      console.log(`Evento joinRoomAsTutor enviado al tutor con ID socket ${tutorSocketId}`);
    } else {
      console.log(`Tutor con ID ${idTutor} no está conectado`);
    }
  }

  // Tutor se une a la room
  @SubscribeMessage('joinRoomAsTutor')
  handleTutorJoinRoom(
    @MessageBody() data: { idPregunta: number },
    @ConnectedSocket() client: Socket,
  ): void {
    const { idPregunta } = data;

    if (this.rooms.has(String(idPregunta))) {
      this.rooms.get(String(idPregunta)).add(client.id);
      client.join(String(idPregunta));
      console.log(`Tutor (${client.id}) unido a la room ${idPregunta}`);
    } else {
      console.log(`Room ${idPregunta} no existe para el tutor`);
    }
  }

  // Notificación de pregunta contestada
  notifyQuestionAnswered(idPregunta: number): void {
    this.server.to(String(idPregunta)).emit('questionAnswered', { idPregunta });
    console.log(`Notificación enviada a room ${idPregunta}`);
  }
}
