import { useCallback, useState } from "react";
import { type Session } from "@/domain/entities/session";
import type { DestinoBandeja } from "@/core/types";
import { statusBadge } from "@/ui/components/library-records/viewmodel";
import { Rol } from "@/domain/entities/rol";
import { EstadoEnvio } from "@/domain/entities/estado-envio";
import { EstadoEjemplar, type Ejemplar } from "@/domain/entities/ejemplar";
import { EstadoSede } from "@/domain/entities/sede";
import { type Remito } from "@/domain/entities/remito";
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
import { allOptions, info, statusInfo, pickData, useLibraryRecordsViewModel, type DetailSpec, type Field } from "@/ui/routes/use-library-records-viewmodel";
import { receptionOptions, seguimientoOptions } from "@/core/utils/constants";

export default function ViewModel(session: Session, initialRecordId?: string, onOpen?: (target: DestinoBandeja) => void) {
    const [recepcionConIncidencia, setRecepcionConIncidencia] = useState(false);
    const estadosIncidencia = [EstadoEjemplar.DISPONIBLE, EstadoEjemplar.EN_REVISION, EstadoEjemplar.DANADO, EstadoEjemplar.EXTRAVIADO, EstadoEjemplar.DESTRUIDO].map((e) => e.toOption());
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

    const handleRegistrarDespacho = (remitoId: string) => {
        return registrarDespachoRemitoAction({ session, id: remitoId });
    };

    const handleRegistrarRecepcion = (remito: Remito, field: ReadField) => {
        const conIncidencia = field("conIncidencia") === "true";
        const incidencias = conIncidencia ? remito.ejemplaresIds.map((ejId) => ({ ejemplar_id: Number(ejId), estado: field(`estado_${ejId}`), observacion: field(`observacion_${ejId}`).trim() })) : undefined;
        return registrarRecepcionRemitoAction({ session, id: remito.id, conIncidencia, incidencias });
    };

    type RemitoDetailData = {
        remito: Remito;
        ejemplares: Ejemplar[];
        trace: Awaited<ReturnType<typeof getTrazabilidadRemitoAction>>;
    };

    const describeRemito = ({ remito, ejemplares: copyList, trace }: RemitoDetailData): DetailSpec => {
        const estado = trace.data?.historial.at(-1)?.estadoEntity ?? (trace.success ? EstadoEnvio.PENDIENTE : undefined);
        const recepcionista = session.user?.roleEntity === Rol.RECEPCIONISTA;
        const canManageOrigin = !recepcionista || session.user?.sedeId === remito.sedeOrigenId;
        const canManageDestination = !recepcionista || session.user?.sedeId === remito.sedeDestinoId;
        const canPack = canManageOrigin && estado === EstadoEnvio.ACEPTADO;
        const canDispatch = canManageOrigin && (estado === EstadoEnvio.EMPACADO || estado === EstadoEnvio.PENDIENTE);
        const canReceive = canManageDestination && (estado === EstadoEnvio.EN_TRANSITO || estado === EstadoEnvio.DESPACHADO);

        const detailCopies = new Map(copyList.map((copy) => [copy.id, copy]));
        const copyIds = new Set([...remito.ejemplaresIds, ...detailCopies.keys()]);

        return {
            actions: onOpen && remito.solicitudId ? [{ label: "Abrir solicitud", onClick: () => onOpen({ modulo: "Solicitudes de préstamo", id: remito.solicitudId }) }] : [],
            info: [
                info("Número", remito.numero),
                ...(remito.solicitudId ? [info("Solicitud de préstamo", remito.solicitudId)] : []),
                info("Sede de origen", sedeNames.get(remito.sedeOrigenId) ?? remito.sedeOrigenId),
                info("Sede de destino", sedeNames.get(remito.sedeDestinoId) ?? remito.sedeDestinoId),
                info("Emisión", remito.fechaEmision),
                info("Despacho", remito.fechaDespacho),
                info("Recepción", remito.fechaRecepcion),
                estado ? statusInfo(estado.name) : info("Estado", trace.error),
                ...(remito.diasTransito !== null ? [info("Días de traslado", remito.diasTransito)] : [])
            ],
            sections: [
                {
                    title: "Ejemplares incluidos",
                    emptyMessage: "No hay ejemplares asociados.",
                    entries: Array.from(copyIds, (id) => {
                        const detailCopy = detailCopies.get(id);
                        const catalogCopy = catalogCopies.get(id);
                        const bookId = detailCopy?.libroId || catalogCopy?.libroId;
                        const title = (bookId && bookTitles.get(bookId)) || "Título no disponible";
                        const code = detailCopy?.codigo || catalogCopy?.codigo || `#${id}`;
                        const copyStatus = detailCopy?.estadoName || catalogCopy?.estado.name;
                        const inc = remito.incidencias.find((item) => item.ejemplarId === id);
                        const detailText = inc ? `Ejemplar ${code} · Incidencia (${EstadoEjemplar.fromString(inc.estado).name}): ${inc.observacion}` : `Ejemplar ${code}`;
                        return { id, label: title, detail: detailText, badge: copyStatus ? statusBadge(copyStatus) : undefined };
                    })
                },
                {
                    title: "Trazabilidad",
                    kind: "timeline",
                    emptyMessage: trace.error || "Sin movimientos registrados.",
                    entries: (trace.data?.historial ?? []).map((item, index, history) => {
                        const responsable = item.responsableNombre || (item.responsableId ? `Usuario ${item.responsableId}` : "");
                        return {
                            id: item.id,
                            label: item.estadoName,
                            current: index === history.length - 1,
                            metadata: [
                                ...(item.fechaInicio ? [info("Inicio", item.fechaInicio)] : []),
                                ...(item.fechaFin ? [info("Fin", item.fechaFin)] : []),
                                ...(responsable ? [info("Responsable", responsable)] : [])
                            ]
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
                fields: [],
                submit: () => handleRegistrarDespacho(remito.id)
            }] : canReceive ? [{
                label: "Registrar recepción",
                fields: [

                    { name: "conIncidencia", label: "Resultado de la recepción", defaultValue: recepcionConIncidencia ? "true" : "false", options: receptionOptions, onChange: (value) => setRecepcionConIncidencia(value === "true") },
                    ...(recepcionConIncidencia ? Array.from(copyIds).flatMap((ejId) => {
                        const detailCopy = detailCopies.get(ejId);
                        const catalogCopy = catalogCopies.get(ejId);
                        const bookId = detailCopy?.libroId || catalogCopy?.libroId;
                        const ejLabel = [(bookId && bookTitles.get(bookId)) || "Ejemplar", detailCopy?.codigo || catalogCopy?.codigo || `#${ejId}`].join(" · ");
                        return [
                            { name: `estado_${ejId}`, label: `${ejLabel} · Estado`, options: estadosIncidencia },
                            { name: `observacion_${ejId}`, label: `${ejLabel} · Observación`, placeholder: "Detalle de la incidencia", required: true }
                        ];
                    }) : [])
                ],
                submit: (field: ReadField) => handleRegistrarRecepcion(remito, field)
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

    const catalogCopies = new Map(catalog.ejemplares?.data?.map((copy) => [copy.value, copy]));
    const bookTitles = new Map(catalog.libros?.data?.map(({ value, titulo }) => [value, titulo]));
    const sedeNames = new Map(catalog?.sedes?.data?.map(({ value, label }) => [value, label]));
    const sedeLabel = (id: string) => sedeNames.get(id) ?? (id ? `Sede ${id}` : "Sin asignar");

    const getRemitoLabel = (remito: Remito) => {
        return `${remito.numero} · ${sedeLabel(remito.sedeOrigenId)} → ${sedeLabel(remito.sedeDestinoId)}`;
    };

    const getRemitoMeta = (remito: Remito) => {
        const emision = remito.fechaEmision ? `Emisión ${String(remito.fechaEmision).slice(0, 10)}` : undefined;
        return [
            remito.diasTransito !== null ? `${remito.diasTransito} días` : undefined,
            emision
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
        newestFirst: true,
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
        getMeta: getRemitoMeta,
        getStatuses: (remito) => [remito.estadoActual?.name ?? "", remito.estaAtrasado ? "Atrasado" : ""],
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

