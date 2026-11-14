import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoReserva } from "@/domain/entities/reserva";
import { createReservaAction, getAllReservasAction, getReservaByIdAction, updateReservaEstadoAction } from "@/ui/actions/reserva/reserva.actions";
import { allOptions, info, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { idField, readFields } from "@/ui/forms/handlers/record-fields";

const nextStates = [EstadoReserva.ATENDIDA, EstadoReserva.CANCELADA, EstadoReserva.VENCIDA].map((estado) => estado.toOption());

export function useViewModel(session: Session) {
    const load = useCallback((filters: { libroId: string; socioId: string; sedeId: string; estado: string }) => getAllReservasAction({
        session, ...filters, estado: filters.estado ? EstadoReserva.fromString(filters.estado) : undefined
    }), [session]);
    const loadDetail = useCallback((id: string) => getReservaByIdAction({ id, session }), [session]);

    return useLibraryRecordsViewModel({
        title: "Reservas", initialFilters: { libroId: "", socioId: "", sedeId: "", estado: "" },
        load, loadDetail,
        filter: { label: "Filtrar", fields: [
            idField("libroId", "ID de libro"), idField("socioId", "ID de socio"), idField("sedeId", "ID de sede"),
            { name: "estado", label: "Estado", options: allOptions(EstadoReserva.toOptions()) }
        ], submit: (field) => readFields(field, "libroId", "socioId", "sedeId", "estado") },
        getLabel: (reserva) => `Reserva · ${reserva.estadoName}`,
        create: {
            label: "Registrar reserva",
            fields: [idField("socioId", "ID de socio", true), idField("libroId", "ID de libro"),
                idField("ejemplarId", "ID de ejemplar"), idField("sedeId", "ID de sede"),
                { name: "fecha", placeholder: "Seleccioná la fecha de reserva", label: "Fecha", type: "date" }],
            submit: async (field) => {
                const libroId = field("libroId") || undefined;
                const ejemplarId = field("ejemplarId") || undefined;
                if (!libroId && !ejemplarId) return { success: false, error: "Completá el ID del libro o del ejemplar." };
                return createReservaAction({
                    session, socioId: field("socioId"), libroId, ejemplarId, sedeId: field("sedeId") || undefined, fecha: field("fecha") || undefined
                });
            }
        },
        describe: (reserva) => ({
            info: [info("Fecha", reserva.fecha), info("Estado", reserva.estadoName), info("Socio", reserva.socioId),
                info("Libro", reserva.libroId), info("Ejemplar", reserva.ejemplarId), info("Sede", reserva.sedeId)],
            forms: reserva.estadoEntity === EstadoReserva.ACTIVA ? [{
                label: "Actualizar estado", fields: [{ name: "estado", label: "Nuevo estado", options: nextStates }],
                submit: (field) => updateReservaEstadoAction({ session, id: reserva.id, estado: EstadoReserva.fromString(field("estado")) })
            }] : []
        })
    });
}
