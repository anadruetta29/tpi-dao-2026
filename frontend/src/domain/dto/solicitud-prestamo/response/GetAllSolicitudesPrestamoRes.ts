import { type SolicitudPrestamo } from "@/domain/entities/solicitud-prestamo";

export interface GetAllSolicitudesPrestamoRes {
    solicitudes: SolicitudPrestamo[];
}
