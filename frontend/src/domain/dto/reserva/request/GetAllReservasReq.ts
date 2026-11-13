import { type Session } from "@/domain/entities/session";
import { type EstadoReserva } from "@/domain/entities/estado-reserva";

export interface GetAllReservasReq {
    libroId?: string;
    socioId?: string;
    sedeId?: string;
    estado?: EstadoReserva;
    session: Session;
}
