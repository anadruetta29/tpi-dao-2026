export interface Recepcionista {
    id: string;
    nombre: string;
    apellido: string;
}

export interface GetRecepcionistasRes {
    recepcionistas: Recepcionista[];
}
