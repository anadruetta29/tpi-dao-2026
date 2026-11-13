import { type Session } from "@/domain/entities/session";
import { type EstadoEjemplar } from "@/domain/entities/estado-ejemplar";

export interface CreateDevolucionReq {
    prestamoId: string;
    fecha: string;
    observaciones?: string;
    estadoDevuelto: EstadoEjemplar;
    session: Session;
}
