import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoEnvio } from "@/domain/entities/estado-envio";
import { createRemitoAction, getAllRemitosAction, getRemitoByIdAction, getTrazabilidadRemitoAction,
    registrarDespachoRemitoAction, registrarRecepcionRemitoAction } from "@/ui/actions/remito/remito.actions";
import { allOptions, idListPattern, info, pickData, readIds, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { idField, readFields } from "@/ui/forms/handlers/record-fields";

const receptionOptions = [{ value: "false", label: "Sin incidencias" }, { value: "true", label: "Con incidencia" }];

export function useViewModel(session: Session) {
    const load = useCallback(async ({ sedeOrigenId, sedeDestinoId, estado }: { sedeOrigenId: string; sedeDestinoId: string; estado: string }) =>
        pickData(await getAllRemitosAction({ session, sede_origen_id: sedeOrigenId, sede_destino_id: sedeDestinoId, estado }), (data) => data.remitos), [session]);
    const loadDetail = useCallback(async (id: string) => {
        const result = await getRemitoByIdAction(id, session);
        if (!result.success || !result.data) return { success: false, error: result.error };
        const trace = await getTrazabilidadRemitoAction(id, session);
        return { success: true, data: { ...result.data, trace } };
    }, [session]);

    return useLibraryRecordsViewModel({
        title: "Remitos", initialFilters: { sedeOrigenId: "", sedeDestinoId: "", estado: "" },
        load, loadDetail,
        filter: { label: "Filtrar", fields: [
            idField("sedeOrigenId", "ID de sede de origen"), idField("sedeDestinoId", "ID de sede de destino"),
            { name: "estado", label: "Estado", options: allOptions(EstadoEnvio.toOptions()) }
        ], submit: (field) => readFields(field, "sedeOrigenId", "sedeDestinoId", "estado") },
        getLabel: (remito) => `${remito.numero} · Sede ${remito.sedeOrigenId} → Sede ${remito.sedeDestinoId}`,
        create: {
            label: "Empaquetar y emitir remito",
            fields: [idField("sedeOrigenId", "ID de sede de origen", true), idField("sedeDestinoId", "ID de sede de destino", true),
                { name: "ejemplaresIds", placeholder: "Ej. 12, 34", label: "IDs de ejemplares (separados por comas)", pattern: idListPattern, required: true },
                { name: "fechaEmision", placeholder: "Seleccioná la fecha de emisión", label: "Fecha de emisión", type: "date" }],
            submit: (field) => createRemitoAction({
                session, ejemplaresIds: readIds(field("ejemplaresIds")), sede_origen_id: field("sedeOrigenId"),
                sede_destino_id: field("sedeDestinoId"), fechaEmision: field("fechaEmision") || undefined
            })
        },
        describe: ({ remito, ejemplares, trace }) => {
            const estado = trace.data?.historial.at(-1)?.estadoEntity ?? (trace.success ? EstadoEnvio.PENDIENTE : undefined);
            const canDispatch = estado === EstadoEnvio.EMPACADO || estado === EstadoEnvio.PENDIENTE;
            const canReceive = estado === EstadoEnvio.EN_TRANSITO || estado === EstadoEnvio.DESPACHADO || estado === EstadoEnvio.CON_INCIDENCIA;
            return {
                info: [info("Número", remito.numero), info("Sede de origen", remito.sedeOrigenId), info("Sede de destino", remito.sedeDestinoId),
                    info("Emisión", remito.fechaEmision), info("Despacho", remito.fechaDespacho), info("Recepción", remito.fechaRecepcion),
                    info("Estado", estado?.name ?? trace.error)],
                sections: [{
                    title: "Ejemplares incluidos", emptyMessage: "No hay ejemplares asociados.",
                    entries: ejemplares.length
                        ? ejemplares.map((item) => ({ id: item.id, label: `ID ${item.id} · ${item.codigo} · ${item.estadoName}` }))
                        : remito.ejemplaresIds.map((id) => ({ id, label: `Ejemplar ${id}` }))
                }, {
                    title: "Trazabilidad", emptyMessage: trace.error || "Sin movimientos registrados.",
                    entries: (trace.data?.historial ?? []).map((item) => ({
                        id: item.id, label: `${item.estadoName} · Inicio: ${info("", item.fechaInicio).value} · Fin: ${info("", item.fechaFin).value}`
                    }))
                }],
                forms: canDispatch ? [{
                    label: "Registrar despacho", fields: [{ name: "fechaDespacho", placeholder: "Seleccioná la fecha de despacho", label: "Fecha de despacho", type: "date" }],
                    submit: (field) => registrarDespachoRemitoAction({ session, id: remito.id, fechaDespacho: field("fechaDespacho") || undefined })
                }] : canReceive ? [{
                    label: "Registrar recepción", fields: [{ name: "fechaRecepcion", placeholder: "Seleccioná la fecha de recepción", label: "Fecha de recepción", type: "date" },
                        { name: "conIncidencia", label: "Resultado de la recepción", options: receptionOptions }],
                    submit: (field) => registrarRecepcionRemitoAction({
                        session, id: remito.id, fechaRecepcion: field("fechaRecepcion") || undefined, conIncidencia: field("conIncidencia") === "true"
                    })
                }] : []
            };
        }
    });
}
