import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoEnvio } from "@/domain/entities/estado-envio";
import { EstadoEjemplar } from "@/domain/entities/ejemplar";
import { EstadoSede } from "@/domain/entities/sede";
import { createRemitoAction, getAllRemitosAction, getRemitoByIdAction, getTrazabilidadRemitoAction,
    registrarDespachoRemitoAction, registrarRecepcionRemitoAction } from "@/ui/actions/remito/remito.actions";
import { allOptions, info, pickData, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { useMultipleSelector, useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";

const receptionOptions = [{ value: "false", label: "Sin incidencias" }, { value: "true", label: "Con incidencia" }];

export function useViewModel(session: Session) {
    const catalog = useSelectorCatalog(session, "sedes", "ejemplares");
    const filterOrigen = useSelector("sedeOrigenId", "Sede de origen", "Buscá por nombre de sede", false);
    const filterDestino = useSelector("sedeDestinoId", "Sede de destino", "Buscá por nombre de sede", false);
    const origen = useSelector("sedeOrigenId", "Sede de origen", "Buscá una sede de origen");
    const destino = useSelector("sedeDestinoId", "Sede de destino", "Buscá una sede de destino");
    const ejemplares = useMultipleSelector("ejemplaresIds", "Ejemplares", "Buscá por título o código");
    const sedes = catalog?.sedes && pickData(catalog.sedes, (items) => items.filter(({ estado }) => estado === EstadoSede.ACTIVA));
    const copies = catalog?.ejemplares && pickData(catalog.ejemplares, (items) => items.filter(({ sedeId, estado }) =>
        sedeId === origen.selected && estado === EstadoEjemplar.DISPONIBLE));
    function changeOrigin(id: string) {
        ejemplares.reset();
        if (id && destino.selected === id) destino.reset();
    }
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
            filterOrigen.field(catalog?.sedes ?? null), filterDestino.field(catalog?.sedes ?? null),
            { name: "estado", label: "Estado", options: allOptions(EstadoEnvio.toOptions()) }
        ], submit: (field) => readFields(field, "sedeOrigenId", "sedeDestinoId", "estado") },
        getLabel: (remito) => `${remito.numero} · Sede ${remito.sedeOrigenId} → Sede ${remito.sedeDestinoId}`,
        create: {
            label: "Empaquetar y emitir remito",
            onOpen: () => { origen.reset(); destino.reset(); ejemplares.reset(); catalog.refresh(); },
            submitDisabled: !origen.selected || !destino.selected || ejemplares.selected.length === 0,
            fields: [
                origen.field(sedes ?? null, undefined, changeOrigin),
                destino.field(sedes ? pickData(sedes, (items) => items.filter(({ value }) => value !== origen.selected)) : null),
                ejemplares.field(origen.selected ? copies ?? null : null, origen.selected ? undefined : "Seleccioná primero la sede de origen."),
                { name: "fechaEmision", placeholder: "Seleccioná la fecha de emisión", label: "Fecha de emisión", type: "date" }],
            submit: (field, values) => createRemitoAction({
                session, ejemplaresIds: values("ejemplaresIds").filter(Boolean), sede_origen_id: field("sedeOrigenId"),
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
