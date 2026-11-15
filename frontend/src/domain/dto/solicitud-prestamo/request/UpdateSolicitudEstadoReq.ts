import { type Session } from "@/domain/entities/session";
import { type ModalidadPrestamoLocal } from "@/domain/entities/modalidad-prestamo-local";
import { type EstadoSolicitud } from "@/domain/entities/estado-solicitud";

export interface UpdateSolicitudEstadoReq {
    id: string;
    estado: EstadoSolicitud;
    modalidad?: ModalidadPrestamoLocal;
    fechaVencimiento?: string;
    session: Session;
}
