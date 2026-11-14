import { useCallback, useState } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoPrestamo, ModalidadPrestamoLocal } from "@/domain/entities/prestamo";
import { cancelarPrestamoAction, createPrestamoAction, getAllPrestamosAction, getPrestamoByIdAction } from "@/ui/actions/prestamo/prestamo.actions";
import { allOptions, info, pickData, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";

import { EstadoSolicitud } from "@/domain/entities/solicitud-prestamo";
import { useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";

function localDateISO() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

function dateKey(value?: string | Date | null) {
    return value instanceof Date ? value.toISOString().slice(0, 10) : value?.slice(0, 10) ?? "";
}

export function useViewModel(session: Session) {
    const [today, setToday] = useState(localDateISO);
    const [startDate, setStartDate] = useState("");
    const catalog = useSelectorCatalog(session, "sedes", "socios", "solicitudes", "prestamos");
    const socio = useSelector("socioId", "Socio", "Buscá por nombre o documento", false);
    const sede = useSelector("sedeId", "Sede", "Buscá por nombre de sede", false);
    const solicitud = useSelector("solicitudId", "Solicitud aprobada", "Buscá por número, libro o socio");
    const solicitudes = catalog?.solicitudes && pickData(catalog.solicitudes, (items) =>
        items.filter(({ estado, value }) => estado === EstadoSolicitud.APROBADA
            && !catalog.prestamos?.data?.some(({ solicitudId }) => solicitudId === value)));
    const load = useCallback(async ({ socioId, sedeId, estado }: { socioId: string; sedeId: string; estado: string }) =>
        pickData(await getAllPrestamosAction({ session, socio_id: socioId, sede_id: sedeId, estado }), (data) => data.prestamos), [session]);
    const loadDetail = useCallback(async (id: string) => pickData(await getPrestamoByIdAction(id, session), (data) => data.prestamo), [session]);

    return useLibraryRecordsViewModel({
        title: "Préstamos", initialFilters: { socioId: "", sedeId: "", estado: "" },
        load, loadDetail,
        filter: { label: "Filtrar", fields: [
            socio.field(catalog?.socios ?? null), sede.field(catalog?.sedes ?? null),
            { name: "estado", label: "Estado", options: allOptions(EstadoPrestamo.toOptions()) }
        ], submit: (field) => readFields(field, "socioId", "sedeId", "estado") },
        getLabel: (prestamo) => `Préstamo · ${prestamo.modalidadName} · ${prestamo.estadoName}`,
        create: {
            label: "Efectivizar préstamo",
            onOpen: () => {
                solicitud.reset();
                catalog.refresh();
                setToday(localDateISO());
                setStartDate("");
            },
            submitDisabled: !solicitud.selected,
            fields: [
                solicitud.field(solicitudes ?? null),
                { name: "modalidad", label: "Modalidad", options: ModalidadPrestamoLocal.toOptions() },
                { name: "fechaInicio", placeholder: "Seleccioná la fecha de inicio", label: "Fecha de inicio",
                    type: "date", min: today, defaultValue: today, required: true, onChange: setStartDate },
                { name: "fechaVencimiento", placeholder: "Seleccioná la fecha de vencimiento", label: "Fecha de vencimiento",
                    type: "date", min: startDate > today ? startDate : today }
            ],
            submit: async (field) => {
                const fechaInicio = field("fechaInicio");
                const fechaVencimiento = field("fechaVencimiento") || undefined;
                if (fechaInicio < localDateISO()) return { success: false, error: "La fecha de inicio debe ser hoy o posterior." };
                if (fechaVencimiento && fechaVencimiento < fechaInicio) {
                    return { success: false, error: "La fecha de vencimiento no puede ser anterior al inicio." };
                }
                return createPrestamoAction({
                    session, solicitud_id: field("solicitudId"),
                    modalidad: ModalidadPrestamoLocal.fromString(field("modalidad")), fechaInicio, fechaVencimiento
                });
            }
        },
        describe: (prestamo) => ({
            info: [info("Solicitud", prestamo.solicitudId), info("Socio", prestamo.socioId), info("Ejemplar", prestamo.ejemplarId),
                info("Sede", prestamo.sedeId), info("Estado", prestamo.estadoName), info("Modalidad", prestamo.modalidadName),
                info("Inicio", prestamo.fechaInicio), info("Vencimiento", prestamo.fechaVencimiento), info("Devolución", prestamo.fechaDevolucion)],
            commands: prestamo.estadoEntity === EstadoPrestamo.ACTIVO && prestamo.fechaInicio
                && dateKey(prestamo.fechaInicio) <= today && today < dateKey(prestamo.fechaVencimiento) ? [{
                    label: "Cancelar anticipadamente",
                    confirm: "Confirmá que recibiste el ejemplar en buen estado. El préstamo se cerrará y se registrará la devolución.",
                    execute: () => cancelarPrestamoAction({ id: prestamo.id, session })
                }] : []
        })
    });
}
