import { useCallback, useEffect, useState } from "react";
import { Rol } from "@/domain/entities/rol";
import { type ActionState } from "@/core/types";
import { EstadoEjemplar, type Ejemplar } from "@/domain/entities/ejemplar";
import { EstadoSede, type Sede } from "@/domain/entities/sede";
import { type Session } from "@/domain/entities/session";
import { createEjemplarAction, getAllEjemplaresAction, getEjemplarByIdAction, updateEjemplarEstadoAction } from "@/ui/actions/ejemplar/ejemplar.actions";
import { getLibroDisponibilidadAction } from "@/ui/actions/libro/libro.actions";
import { getAllSedesAction } from "@/ui/actions/sede/sede.actions";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { allOptions, info, statusInfo, pickData, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";
import type { SolicitudInterbibliotecariaInicial } from "@/core/types";

export default function ViewModel(session: Session, libroId: string, onSolicitar?: (initial: SolicitudInterbibliotecariaInicial) => void) {
    const [sedesResult, setSedesResult] = useState<ActionState<Sede[]> | null>(null);
    const [revision, setRevision] = useState(0);
    const [disponibilidad, setDisponibilidad] = useState<Awaited<ReturnType<typeof getLibroDisponibilidadAction>> | null>(null);
    const [revisionDisponibilidad, setRevisionDisponibilidad] = useState(0);

    {/* ===== Main useEffects ===== */ }

    useEffect(() => {
        let active = true;
        void getAllSedesAction({ session }).then((result) => {
            if (active) setSedesResult(result);
        });
        return () => {
            active = false;
        };
    }, [session, revision]);

    useEffect(() => {
        let active = true;
        void getLibroDisponibilidadAction(libroId, session).then((result) => {
            if (active) setDisponibilidad(result);
        });
        return () => { active = false; };
    }, [libroId, session, revisionDisponibilidad]);

    {/* ===== Fetch data ===== */ }

    const fetchEjemplares = useCallback(async ({ sedeId, estado }: { sedeId: string; estado: string }) => {
        const result = await getAllEjemplaresAction({ session, libro_id: libroId, sede_id: sedeId, estado });
        return pickData(result, (data) => data.ejemplares);
    }, [session, libroId]);

    const fetchEjemplarDetail = useCallback(async (id: string) => {
        const result = await getEjemplarByIdAction(id, session);
        return pickData(result, (data) => data.ejemplar);
    }, [session]);

    {/* ===== onActions functions ===== */ }

    const onRetrySedes = () => {
        setSedesResult(null);
        setRevision((current) => current + 1);
    };

    const refreshDisponibilidad = () => {
        setDisponibilidad(null);
        setRevisionDisponibilidad((current) => current + 1);
    };

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "sedeId", "estado");
    };

    const handleCreateEjemplar = async (field: ReadField) => {
        const result = await createEjemplarAction({
            session,
            codigo: field("codigo"),
            libro_id: libroId,
            sede_id: field("sedeId")
        });
        if (result.success) refreshDisponibilidad();
        return result;
    };

    const describeEjemplar = (ejemplar: Ejemplar) => {
        const enRevision =
            ejemplar.estadoEntity === EstadoEjemplar.DANADO ||
            ejemplar.estadoEntity === EstadoEjemplar.EN_REVISION;
        const puedeGestionarSede = !session.user?.sedeId || session.user.sedeId === ejemplar.sedeId;

        return {
            info: [
                info("Código", ejemplar.codigo),
                info("Sede", sedeNames.get(ejemplar.sedeId)),
                statusInfo(ejemplar.estadoName)
            ],
            commands: enRevision && puedeGestionarSede
                ? [
                    {
                        label: "Marcar disponible",
                        confirm: "¿Rehabilitar este ejemplar y marcarlo como disponible?",
                        execute: async () => {
                            const result = await updateEjemplarEstadoAction({
                                session,
                                id: ejemplar.id,
                                estado: EstadoEjemplar.DISPONIBLE
                            });
                            if (result.success) refreshDisponibilidad();
                            return result;
                        }
                    },
                    {
                        label: "Dar de baja (Destruido)",
                        tone: "danger" as const,
                        confirm: "¿Dar de baja definitivamente este ejemplar como destruido?",
                        execute: async () => {
                            const result = await updateEjemplarEstadoAction({
                                session,
                                id: ejemplar.id,
                                estado: EstadoEjemplar.DESTRUIDO
                            });
                            if (result.success) refreshDisponibilidad();
                            return result;
                        }
                    }
                ]
                : undefined
        };
    };

    {/* ===== variables ===== */ }

    const sedes = sedesResult?.data ?? [];
    const sedeNames = new Map(sedes.map(({ id, nombre }) => [id, nombre]));

    const sedeOptions = sedes.map(({ id, nombre, estadoEntity }) => ({
        value: id,
        label: nombre,
        isActive: estadoEntity === EstadoSede.ACTIVA
    }));

    const activeSedeOptions = sedeOptions.filter(({ isActive }) => isActive);

    const getEjemplarLabel = (ejemplar: Ejemplar) => ejemplar.codigo;

    const getEjemplarMeta = (ejemplar: Ejemplar) => {
        return [sedeNames.get(ejemplar.sedeId) ?? "Sede no disponible"].filter(Boolean).join(" · ");
    };

    const filterFields: Field[] = [
        { name: "sedeId", label: "Sede", options: allOptions(sedeOptions) },
        { name: "estado", label: "Estado", options: allOptions(EstadoEjemplar.toOptions()) }
    ];

    const createFields: Field[] = [
        { name: "codigo", placeholder: "Ej. EJ-001", label: "Código", required: true },
        {
            name: "sedeId",
            label: "Sede",
            required: true,
            defaultValue: "",
            options: [{ value: "", label: "Seleccioná una sede" }, ...activeSedeOptions]
        }
    ];

    const records = useLibraryRecordsViewModel({
        title: "Ejemplares físicos",
        initialFilters: { sedeId: "", estado: "" },
        load: fetchEjemplares,
        loadDetail: fetchEjemplarDetail,
        filter: {
            label: "Filtrar ejemplares",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        getLabel: getEjemplarLabel,
        getMeta: getEjemplarMeta,
        getStatuses: (ejemplar) => [ejemplar.estadoName],
        create: {
            label: "Registrar ejemplar",
            fields: createFields,
            submitDisabled: activeSedeOptions.length === 0,
            submit: handleCreateEjemplar
        },
        describe: describeEjemplar
    });

    const sedePropia = session.user?.sedeId ?? "";
    const recepcionista = session.user?.roleEntity === Rol.RECEPCIONISTA;
    const stock = (disponibilidad?.data?.sedes ?? []).map(({ sedeId, sedeNombre, sedeActiva, disponibles, ejemplares }) => {
        const ejemplar = ejemplares.find((item) => item.estado === EstadoEjemplar.DISPONIBLE);
        const canRequest = sedeActiva && disponibles > 0 && (!recepcionista || (sedePropia && sedeId !== sedePropia));
        const label = sedeNombre || (sedeId ? `Sede ${sedeId}` : "Sin sede asignada");
        const summary = sedeActiva ? `${disponibles} de ${ejemplares.length} disponibles` : "Sin préstamos habilitados";
        return {
            id: sedeId, label, summary, local: Boolean(sedePropia && sedePropia === sedeId),
            meterLabel: `${label}, ${summary}`, total: ejemplares.length || 1, available: sedeActiva ? disponibles : 0,
            tone: !sedeActiva ? "inactive" : disponibles > 0 ? "success" : "attention",
            request: canRequest && ejemplar && onSolicitar ? () => onSolicitar({
                sedeOrigenId: sedeId,
                sedeDestinoId: sedePropia !== sedeId ? sedePropia : "",
                ejemplarId: ejemplar.id
            }) : undefined
        };
    });

    return {
        stock,
        records,
        loadingSedes: sedesResult === null,
        sedesError: sedesResult && !sedesResult.success ? sedesResult.error || "No se pudieron cargar las sedes." : null,
        noActiveSedes: Boolean(sedesResult?.success && activeOptionsLengthZero(activeSedeOptions)),
        retrySedes: onRetrySedes,
        disponibilidad,
        refreshDisponibilidad
    };
}

function activeOptionsLengthZero(options: unknown[]): boolean {
    return options.length === 0;
}
