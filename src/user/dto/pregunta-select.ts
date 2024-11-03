export const preguntaSelect = {
    idPregunta: true,
    idUsuarioPupilo: true,
    titulo: true,
    descripcion: true,
    idEstadoPregunta: true,
    fechaPublicacion: true,
    materia: {
        select: {
            materia: true,
        }
    },
    imgpregunta: {
        select: {
            img: true,
        }
    },
    ofertaresolucion: {
        select: {
            idOferta: true,
            estadoOfertaSolucion: true,
            idPregunta: true,
            descripcion: true,
            fechaOferta: true,
            usuario: {
                select: {
                    valoracion: true,
                    correo: true,
                    idUsuario: true,
                    fotoPerfil: true,
                    nombre: {
                        select: {
                            primerNombre: true,
                            primerApellido: true
                        }
                    }
                }
            }
        }
    }
};