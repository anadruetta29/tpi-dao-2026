import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoPrestamo, ModalidadPrestamoLocal } from "@/domain/entities/prestamo";
import { createPrestamoAction, getAllPrestamosAction, getPrestamoByIdAction } from "@/ui/actions/prestamo/prestamo.actions";
import { allOptions, info, pickData, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { idField, readFields } from "@/ui/forms/handlers/record-fields";

export function useViewModel(session: Session) {
    const load = useCallback(async ({ socioId, sedeId, estado }: { socioId: string; sedeId: string; estado: string }) =>
        pickData(await getAllPrestamosAction({ session, socio_id: socioId, sede_id: sedeId, estado }), (data) => data.prestamos), [session]);
    const loadDetail = useCallback(async (id: string) => pickData(await getPrestamoByIdAction(id, session), (data) => data.prestamo), [session]);

    return useLibraryRecordsViewModel({
        title: "Préstamos", initialFilters: { socioId: "", sedeId: "", estado: "" },
        load, loadDetail,
        filter: { label: "Filtrar", fields: [
            idField("socioId", "ID de socio"), idField("sedeId", "ID de sede"),
            { name: "estado", label: "Estado", options: allOptions(EstadoPrestamo.toOptions()) }
        ], submit: (field) => readFields(field, "socioId", "sedeId", "estado") },
        getLabel: (prestamo) => `Préstamo · ${prestamo.modalidadName} · ${prestamo.estadoName}`,
        create: {
            label: "Efectivizar préstamo",
            fields: [
                idField("solicitudId", "ID de solicitud aprobada", true),
                { name: "modalidad", label: "Modalidad", options: ModalidadPrestamoLocal.toOptions() },
                { name: "fechaInicio", placeholder: "Seleccioná la fecha de inicio", label: "Fecha de inicio", type: "date" },
                { name: "fechaVencimiento", placeholder: "Seleccioná la fecha de vencimiento", label: "Fecha de vencimiento", type: "date" }
            ],
            submit: (field) => createPrestamoAction({
                session, solicitud_id: field("solicitudId"), modalidad: ModalidadPrestamoLocal.fromString(field("modalidad")),
                fechaInicio: field("fechaInicio") || undefined, fechaVencimiento: field("fechaVencimiento") || undefined
            })
        },
        describe: (prestamo) => ({
            info: [info("Solicitud", prestamo.solicitudId), info("Socio", prestamo.socioId), info("Ejemplar", prestamo.ejemplarId),
                info("Sede", prestamo.sedeId), info("Estado", prestamo.estadoName), info("Modalidad", prestamo.modalidadName),
                info("Inicio", prestamo.fechaInicio), info("Vencimiento", prestamo.fechaVencimiento), info("Devolución", prestamo.fechaDevolucion)]
        })
    });
}
