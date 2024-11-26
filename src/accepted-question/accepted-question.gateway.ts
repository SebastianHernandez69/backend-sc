import { 
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket, } from '@nestjs/websockets';
import { Server, Socket} from 'socket.io';

@WebSocketGateway({cors: {origin: '*'}})
export class AcceptedQuestionGateway {
  
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, Set<string>> = new Map();

  // Unir pupilo y tutor a la misma room
  @SubscribeMessage('joinRoomAcceptedOffer')
  handleJoinRoom(
    @MessageBody() data: { idPregunta: number; idTutor: number },
    @ConnectedSocket() client: Socket,
  ): void {
    const { idPregunta, idTutor } = data;
    
    if (!this.rooms.has(String(idPregunta))) {
      this.rooms.set(String(idPregunta), new Set());
    }

    this.rooms.get(String(idPregunta)).add(client.id);
    client.join(String(idPregunta));
    console.log(`Pupilo (${client.id}) unido a la room ${String(idPregunta)}`);

    this.server.to(String(idTutor)).emit('joinRoomAsTutor', { idPregunta });
  }

  @SubscribeMessage('joinRoomAsTutor')
  handleTutorJoinRoom(
    @MessageBody() data: { idPregunta: number },
    @ConnectedSocket() client: Socket,
  ): void{
    const {idPregunta} = data;

    if(this.rooms.has(String(idPregunta))){
      this.rooms.get(String(idPregunta)).add(client.id);
      client.join(String(idPregunta));
      console.log(`Tutor ${client.id} unido a la room ${idPregunta}`);
    }
  }

  @SubscribeMessage('leaveRoomAcceptedQuestion')
  handleLeaveRoom(
    @MessageBody() data:{ idPregunta: number },
    @ConnectedSocket() client: Socket
  ): void{

    const {idPregunta} = data;
    
    if( this.rooms.has(String(idPregunta))){
      this.rooms.get(String(idPregunta)).delete(client.id);
      client.leave(String(idPregunta));

      // Eliminar la room si está vacía
      if (this.rooms.get(String(idPregunta)).size === 0) {
        this.rooms.delete(String(idPregunta));
        console.log(`Room ${String(idPregunta)} eliminada`);
      }
    }
  }

  //
  notifyQuestionAnswered(idPregunta: number): void {
    this.server.to(String(idPregunta)).emit('questionAnswered', { idPregunta });
    console.log(`Notificacion enviada a room ${idPregunta}`);
  }

  // Limpiar cliente si se desconecta
  handleDisconnect(client: Socket): void {
    for (const [idPregunta, clients] of this.rooms.entries()) {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        console.log(`Cliente ${client.id} eliminado de la room ${idPregunta}`);

        if (clients.size === 0) {
          this.rooms.delete(idPregunta);
          console.log(`Room ${idPregunta} eliminada por desconexión`);
        }
      }
    }
  }
}
