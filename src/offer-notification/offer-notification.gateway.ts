import { 
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket, } from '@nestjs/websockets';
  import { Server, Socket} from 'socket.io';

@WebSocketGateway({cors: { origin: '*' }})
export class OfferNotificationGateway {

  @WebSocketServer()
  server: Server;

  // suscribir al usuario a una room
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() idPupilo: number, @ConnectedSocket() client: Socket): void {
    const roomName = String(idPupilo);

    if (client.rooms.has(roomName)) {
      return;
    }

    client.join(roomName);
    console.log(`El pupilo con ID ${idPupilo} se unió a la sala`);
  }

  // enviar notificacion de nueva oferta a la room del pupilo
  sendNewOfferNotification(idPupilo: number, idOferta: number) {
    this.server.to(String(idPupilo)).emit('newOfferNotification', {idOferta});
    console.log(`Notificación enviada al pupilo con ID ${idPupilo} para la oferta ${idOferta}`);
  }

  // Offer-questions
  @SubscribeMessage('joinOfferQuestions')
  handleJoinRoomOfferQuestions(@ConnectedSocket() client: Socket){
    const roomName = 'offerQuestions';

    if(client.rooms.has(roomName)){
      return
    }

    client.join(roomName);
    console.log(`Usuario se a unido a la room ${roomName}`);
  }

  // notificar a los user que se acepto una pregunta
  sendStateChangeQuestion(idPregunta: number, idOferta: number){
    const roomName = 'offerQuestions';

    const clientsInRoom = this.server.sockets.adapter.rooms.get(roomName);
    console.log(`Clientes en la sala ${roomName}:`, clientsInRoom);

    this.server.in(roomName).emit('questionStateUpdate', {idPregunta, idOferta});
    console.log(`Oferta: ${idOferta} aceptada de la pregunta: ${idPregunta}`);
  }
}
