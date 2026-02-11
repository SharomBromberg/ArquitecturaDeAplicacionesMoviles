//Esta la capa de dominio donde se definen los modelos de datos

//El contrato que define la estructura de un objeto Tarea
export interface ITask {
    id: number;
    title: string;
    completed: boolean;
}

//La entidad: es el objeto REAL con el que va a trabajar la app

export class Task implements ITask {
    constructor(
        public id: number,
        public title: string,
        public completed: boolean = false
    ) {}
    //El constructor le dice al sistema lo que necesita para funcionar,
    // le esta está diciendo necesito que me entregues un taskservice aquí mismo
}