import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { Rol } from "@/domain/entities/rol";
import { EstadoEnvio } from "@/domain/entities/estado-envio";
import { EstadoEjemplar, type Ejemplar } from "@/domain/entities/ejemplar";
import { EstadoSede } from "@/domain/entities/sede";
import { DIAS_PARA_ATRASO_REMITO, type Remito } from "@/domain/entities/remito";
import { filtrarRemitosPorSeguimiento } from "@/domain/filters/remito-filters";
import {
    createRemitoAction,
    getAllRemitosAction,
    getRemitoByIdAction,
    getTrazabilidadRemitoAction,
    registrarDespachoRemitoAction,
    registrarEmpaqueRemitoAction,
    registrarRecepcionRemitoAction
} from "@/ui/actions/remito/remito.actions";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField, type ReadFieldValues } from "@/ui/forms/handlers/read-form";
import { useMultipleSelector, useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { allOptions, info, pickData, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";

const receptionOptions = [
    { value: "false", label: "Sin incidencias" },
    { value: "true", label: "Con incidencia" }
];

const seguimientoOptions = allOptions([
    { value: "pendientes", label: "Pendientes" },
    { value: "atrasados", label: `Atrasados (${DIAS_PARA_ATRASO_REMITO} días o más)` },
    { value: "incidencias", label: "Incidencias sin resolver" }
]);

export function useViewModel(session: Session, initialRecordId?: string) {
    const catalog = useSelectorCatalog(session, "sedes", "ejemplares");
    const filterOrigen = useSelector("sedeOrigenId", "Sede de origen", "Buscá por nombre de sede", false);
    const filterDestino = useSelector("sedeDestinoId", "Sede de destino", "Buscá por nombre de sede", false);
    const origen = useSelector("sedeOrigenId", "Sede de origen", "Buscá una sede de origen");
    const destino = useSelector("sedeDestinoId", "Sede de destino", "Buscá una sede de destino");
    const ejemplares = useMultipleSelector("ejemplaresIds", "Ejemplares", "Buscá por título o código");

    {/* ===== Fetch data ===== */ }

    const fetchRemitos = useCallback(async ({ sedeOrigenId, sedeDestinoId, estado, seguimiento }: {
        sedeOrigenId: string; sedeDestinoId: string; estado: string; seguimiento: string;
    }) => {
        const result = await getAllRemitosAction({ session, sede_origen_id: sedeOrigenId, sede_destino_id: sedeDestinoId, estado });
        return pickData(result, ({ remitos }) => filtrarRemitosPorSeguimiento(remitos, seguimiento)
            .toSorted((a, b) => Number(b.estaAtrasado) - Number(a.estaAtrasado)
                || (b.diasTransito ?? 0) - (a.diasTransito ?? 0)));
    }, [session]);

    const fetchRemitoDetail = useCallback(async (id: string) => {
        const result = await getRemitoByIdAction(id, session);
        if (!result.success || !result.data) {
            return { success: false, error: result.error };
        }
        const trace = await getTrazabilidadRemitoAction(id, session);
        return { success: true, data: { ...result.data, trace } };
    }, [session]);

    {/* ===== onActions functions ===== */ }

    const onChangeOrigin = (id: string) => {
        ejemplares.reset();
        if (id && destino.selected === id) {
            destino.reset();
        }
    };

    const onOpenCreate = () => {
        origen.reset();
        destino.reset();
        ejemplares.reset();
        catalog.refresh();
    };

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "sedeOrigenId", "sedeDestinoId", "estado", "seguimiento");
    };

    const handleCreateRemito = (field: ReadField, values: ReadFieldValues) => {
        return createRemitoAction({
            session,
            ejemplaresIds: values("ejemplaresIds").filter(Boolean),
            sede_origen_id: field("sedeOrigenId"),
            sede_destino_id: field("sedeDestinoId"),
            fechaEmision: field("fechaEmision") || undefined
        });
    };

    const handleRegistrarDespacho = (remitoId: string, field: ReadField) => {
        return registrarDespachoRemitoAction({
            session,
            id: remitoId,
            fechaDespacho: field("fechaDespacho") || undefined
        });
    };

    const handleRegistrarRecepcion = (remitoId: string, field: ReadField) => {
        return registrarRecepcionRemitoAction({
            session,
            id: remitoId,
            fechaRecepcion: field("fechaRecepcion") || undefined,
            conIncidencia: field("conIncidencia") === "true"
        });
    };

    type RemitoDetailData = {
        remito: Remito;
        ejemplares: Ejemplar[];
        trace: Awaited<ReturnType<typeof getTrazabilidadRemitoAction>>;
    };

    const describeRemito = ({ remito, ejemplares: copyList, trace }: RemitoDetailData) => {
        const estado = trace.data?.historial.at(-1)?.estadoEntity ?? (trace.success ? EstadoEnvio.PENDIENTE : undefined);
        const recepcionista = session.user?.roleEntity === Rol.RECEPCIONISTA;
        const canManageOrigin = !recepcionista || session.user?.sedeId === remito.sedeOrigenId;
        const canManageDestination = !recepcionista || session.user?.sedeId === remito.sedeDestinoId;
        const canPack = canManageOrigin && estado === EstadoEnvio.ACEPTADO;
        const canDispatch = canManageOrigin && (estado === EstadoEnvio.EMPACADO || estado === EstadoEnvio.PENDIENTE);
        const canReceive = canManageDestination && (estado === EstadoEnvio.EN_TRANSITO
            || estado === EstadoEnvio.DESPACHADO || estado === EstadoEnvio.CON_INCIDENCIA);

        return {
            info: [
                info("Número", remito.numero),
                ...(remito.solicitudId ? [info("Solicitud de préstamo", remito.solicitudId)] : []),
                info("Sede de origen", sedeNames.get(remito.sedeOrigenId) ?? remito.sedeOrigenId),
                info("Sede de destino", sedeNames.get(remito.sedeDestinoId) ?? remito.sedeDestinoId),
                info("Emisión", remito.fechaEmision),
                info("Despacho", remito.fechaDespacho),
                info("Recepción", remito.fechaRecepcion),
                info("Estado", estado?.name ?? trace.error),
                ...(remito.diasTransito !== null ? [info("Días de traslado", remito.diasTransito)] : [])
            ],
            sections: [
                {
                    title: "Ejemplares incluidos",
                    emptyMessage: "No hay ejemplares asociados.",
                    entries: copyList.length
                        ? copyList.map((item) => ({ id: item.id, label: `ID ${item.id} · ${item.codigo} · ${item.estadoName}` }))
                        : remito.ejemplaresIds.map((id) => ({ id, label: `Ejemplar ${id}` }))
                },
                {
                    title: "Trazabilidad",
                    emptyMessage: trace.error || "Sin movimientos registrados.",
                    entries: (trace.data?.historial ?? []).map((item) => {
                        const responsable = item.responsableNombre || (item.responsableId ? `Usuario ${item.responsableId}` : "Sin registrar");
                        return {
                            id: item.id,
                            label: `${item.estadoName} · ${responsable} · Inicio: ${info("", item.fechaInicio).value} · Fin: ${info("", item.fechaFin).value}`
                        };
                    })
                }
            ],
            forms: canPack ? [{
                label: "Registrar empaque",
                fields: [],
                submit: () => registrarEmpaqueRemitoAction(remito.id, session)
            }] : canDispatch ? [{
                label: "Registrar despacho",
                fields: [{ name: "fechaDespacho", placeholder: "Seleccioná la fecha de despacho", label: "Fecha de despacho", type: "date" }],
                submit: (field: ReadField) => handleRegistrarDespacho(remito.id, field)
            }] : canReceive ? [{
                label: "Registrar recepción",
                fields: [
                    { name: "fechaRecepcion", placeholder: "Seleccioná la fecha de recepción", label: "Fecha de recepción", type: "date" },
                    { name: "conIncidencia", label: "Resultado de la recepción", options: receptionOptions }
                ],
                submit: (field: ReadField) => handleRegistrarRecepcion(remito.id, field)
            }] : []
        };
    };

    {/* ===== variables ===== */ }

    const activeSedes = catalog?.sedes ? pickData(catalog.sedes, (items) =>
        items.filter(({ estado }) => estado === EstadoSede.ACTIVA)
    ) : null;
    const originSedes = activeSedes && session.user?.roleEntity === Rol.RECEPCIONISTA
        ? pickData(activeSedes, (items) => items.filter(({ value }) => value === session.user?.sedeId))
        : activeSedes;

    const availableCopies = catalog?.ejemplares ? pickData(catalog.ejemplares, (items) =>
        items.filter(({ sedeId, estado }) =>
            sedeId === origen.selected && estado === EstadoEjemplar.DISPONIBLE
        )
    ) : null;

    const sedeNames = new Map(catalog?.sedes?.data?.map(({ value, label }) => [value, label]));
    const sedeLabel = (id: string) => sedeNames.get(id) ?? (id ? `Sede ${id}` : "Sin asignar");

    const getRemitoLabel = (remito: Remito) => {
        return [
            remito.numero,
            `${sedeLabel(remito.sedeOrigenId)} → ${sedeLabel(remito.sedeDestinoId)}`,
            remito.estadoActual?.name,
            remito.diasTransito !== null ? `${remito.diasTransito} días` : undefined,
            remito.estaAtrasado ? "Atrasado" : undefined
        ].filter(Boolean).join(" · ");
    };

    const filterFields: Field[] = [
        filterOrigen.field(catalog?.sedes ?? null),
        filterDestino.field(catalog?.sedes ?? null),
        { name: "estado", label: "Estado", options: allOptions(EstadoEnvio.toOptions()) },
        { name: "seguimiento", label: "Seguimiento", options: seguimientoOptions }
    ];

    const createFields: Field[] = [
        origen.field(originSedes, undefined, onChangeOrigin),
        destino.field(activeSedes ? pickData(activeSedes, (items) => items.filter(({ value }) => value !== origen.selected)) : null),
        ejemplares.field(origen.selected ? availableCopies ?? null : null, origen.selected ? undefined : "Seleccioná primero la sede de origen."),
        { name: "fechaEmision", placeholder: "Seleccioná la fecha de emisión", label: "Fecha de emisión", type: "date" }
    ];

    return useLibraryRecordsViewModel({
        initialRecordId,
        title: "Remitos",
        initialFilters: { sedeOrigenId: "", sedeDestinoId: "", estado: "", seguimiento: "" },
        load: fetchRemitos,
        loadDetail: fetchRemitoDetail,
        filter: {
            label: "Filtrar",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        getLabel: getRemitoLabel,
        create: {
            label: "Empaquetar y emitir remito",
            onOpen: onOpenCreate,
            submitDisabled: !origen.selected || !destino.selected || ejemplares.selected.length === 0,
            fields: createFields,
            submit: handleCreateRemito
        },
        describe: describeRemito
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
