import { type Session } from "@/domain/entities/session";
import { type EstadoReserva } from "@/domain/entities/estado-reserva";

export interface UpdateReservaEstadoReq {
    id: string;
    estado: EstadoReserva;
    session: Session;
}
