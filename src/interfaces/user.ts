export interface User{
   idUsuario?: number;
   idAdmin?: number;
   idRol?: number;
   idNombre: number;
   edad?: number;
   correo: string;
   contrasenia: string;
   dni?: string;
   telefono?: string;
   valoracion?: number;
   fotoPerfil?: string;
   horarioDisponibleInicio?: Date;
   horarioDisponibleFin?: Date;
   isverified?: boolean;
   verificationcode?: string;
   verificationexpiry?: Date;
   isenabled?: boolean;
}