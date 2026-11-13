import { type Session } from "@/domain/entities/session";
import { ModalidadPrestamoLocal } from "@/domain/entities/modalidad-prestamo-local";
import { EstadoPrestamo } from "@/domain/entities/estado-prestamo";

export interface CreatePrestamoReq {
    session: Session;
    solicitud_id: string;
    modalidad: ModalidadPrestamoLocal | string;
    fechaInicio?: string | null;
    fechaVencimiento?: string | null;
    estado?: EstadoPrestamo | string;
}
