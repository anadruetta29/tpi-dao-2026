import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoMulta, MotivoMulta } from "@/domain/entities/multa";
import { anularMultaAction, createMultaAction, getAllMultasAction, getMultaByIdAction, pagarMultaAction } from "@/ui/actions/multa/multa.actions";
import { allOptions, info, pickData, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";

import { useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";

export function useViewModel(session: Session) {
    const catalog = useSelectorCatalog(session, "socios", "prestamos");
    const filterSocio = useSelector("socioId", "Socio", "Buscá por nombre o documento", false);
    const socio = useSelector("socioId", "Socio", "Buscá por nombre o documento");
    const prestamo = useSelector("prestamoId", "Préstamo", "Buscá por libro o código de ejemplar");
    const prestamos = catalog?.prestamos && pickData(catalog.prestamos, (items) =>
        items.filter(({ socioId }) => socioId === socio.selected));
    const load = useCallback(async ({ socioId, estado }: { socioId: string; estado: string }) =>
        pickData(await getAllMultasAction({ session, socio_id: socioId, estado }), (data) => data.multas), [session]);
    const loadDetail = useCallback(async (id: string) => pickData(await getMultaByIdAction(id, session), (data) => data.multa), [session]);

    return useLibraryRecordsViewModel({
        title: "Multas", initialFilters: { socioId: "", estado: "" },
        load, loadDetail,
        filter: { label: "Filtrar", fields: [
            filterSocio.field(catalog?.socios ?? null), { name: "estado", label: "Estado", options: allOptions(EstadoMulta.toOptions()) }
        ], submit: (field) => readFields(field, "socioId", "estado") },
        getLabel: (multa) => `${multa.motivoName} · ${multa.estadoName} · $${multa.monto}`,
        create: {
            label: "Registrar multa",
            onOpen: () => { socio.reset(); prestamo.reset(); catalog.refresh(); },
            submitDisabled: !socio.selected || !prestamo.selected,
            fields: [
                socio.field(catalog?.socios ?? null, undefined, prestamo.reset),
                prestamo.field(socio.selected ? prestamos ?? null : null, socio.selected ? undefined : "Seleccioná primero un socio."),
                { name: "motivo", label: "Motivo", options: MotivoMulta.toOptions() },
                { name: "monto", placeholder: "Ej. 1500", label: "Monto", type: "number", min: 0.01, step: 0.01, required: true }],
            submit: (field) => createMultaAction({
                session, socio_id: field("socioId"), prestamo_id: field("prestamoId"),
                motivo: MotivoMulta.fromString(field("motivo")), monto: Number(field("monto"))
            })
        },
        describe: (multa) => ({
            info: [info("Socio", multa.socioId), info("Préstamo", multa.prestamoId), info("Motivo", multa.motivoName),
                info("Estado", multa.estadoName), info("Monto", `$${multa.monto}`), info("Emisión", multa.fechaEmision), info("Pago", multa.fechaPago)],
            forms: multa.estadoEntity === EstadoMulta.PENDIENTE ? [{
                label: "Registrar pago", fields: [{ name: "fechaPago", placeholder: "Seleccioná la fecha de pago", label: "Fecha de pago", type: "date" }],
                submit: (field) => pagarMultaAction(multa.id, field("fechaPago") || undefined, session)
            }] : [],
            commands: multa.estadoEntity === EstadoMulta.PENDIENTE ? [{
                label: "Anular multa", confirm: `¿Querés anular la multa ${multa.id}?`, execute: () => anularMultaAction(multa.id, session)
            }] : []
        })
    });
}
