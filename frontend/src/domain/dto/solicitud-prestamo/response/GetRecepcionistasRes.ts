export interface Recepcionista {
    id: string;
    nombre: string;
    apellido: string;
    sedeId: string;
}

export interface GetRecepcionistasRes {
    recepcionistas: Recepcionista[];
}
