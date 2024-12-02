export const ansQuestionSelect = {
    pregunta: {
        select: {
            titulo: true,
            descripcion: true,
            materia: {
                select: {
                    materia: true
                }
            }
        }
    },
    fechaContestada: true,
}