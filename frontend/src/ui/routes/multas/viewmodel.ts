import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoMulta, MotivoMulta } from "@/domain/entities/multa";
import { anularMultaAction, createMultaAction, getAllMultasAction, getMultaByIdAction, pagarMultaAction } from "@/ui/actions/multa/multa.actions";
import { allOptions, info, pickData, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { idField, readFields } from "@/ui/forms/handlers/record-fields";

export function useViewModel(session: Session) {
    const load = useCallback(async ({ socioId, estado }: { socioId: string; estado: string }) =>
        pickData(await getAllMultasAction({ session, socio_id: socioId, estado }), (data) => data.multas), [session]);
    const loadDetail = useCallback(async (id: string) => pickData(await getMultaByIdAction(id, session), (data) => data.multa), [session]);

    return useLibraryRecordsViewModel({
        title: "Multas", initialFilters: { socioId: "", estado: "" },
        load, loadDetail,
        filter: { label: "Filtrar", fields: [
            idField("socioId", "ID de socio"), { name: "estado", label: "Estado", options: allOptions(EstadoMulta.toOptions()) }
        ], submit: (field) => readFields(field, "socioId", "estado") },
        getLabel: (multa) => `${multa.motivoName} · ${multa.estadoName} · $${multa.monto}`,
        create: {
            label: "Registrar multa",
            fields: [idField("socioId", "ID de socio", true), idField("prestamoId", "ID de préstamo", true),
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
