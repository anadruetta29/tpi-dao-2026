import { useEffect, useState } from "react";
import { type ActionState } from "@/core/types";
import { type Aviso } from "@/domain/entities/aviso";
import { EstadoEjemplar } from "@/domain/entities/devolucion";
import { EstadoEjemplar as EstadoCopia } from "@/domain/entities/ejemplar";
import { EstadoEnvio } from "@/domain/entities/estado-envio";
import { EstadoPrestamo, ModalidadPrestamoLocal } from "@/domain/entities/prestamo";
import { EstadoReserva } from "@/domain/entities/estado-reserva";
import { EstadoSolicitud, TipoPrestamo } from "@/domain/entities/solicitud-prestamo";
import { Rol } from "@/domain/entities/rol";
import { type Sede } from "@/domain/entities/sede";
import { type Session } from "@/domain/entities/session";
import { getAllAvisosAction, marcarAvisoLeidoAction } from "@/ui/actions/aviso/aviso.actions";
import { createDevolucionAction } from "@/ui/actions/devolucion/devolucion.actions";
import {
    buscarMostradorCompletoAction,
    type CriterioMostrador,
    type MostradorResultado
} from "@/ui/actions/mostrador/mostrador.actions";
import { pagarMultaAction } from "@/ui/actions/multa/multa.actions";
import { getAllPrestamosAction, renovarPrestamoAction } from "@/ui/actions/prestamo/prestamo.actions";
import {
    getAllRemitosAction,
    registrarDespachoRemitoAction,
    registrarEmpaqueRemitoAction,
    registrarRecepcionRemitoAction
} from "@/ui/actions/remito/remito.actions";
import { getAllReservasAction, updateReservaEstadoAction } from "@/ui/actions/reserva/reserva.actions";
import { getAllSedesAction } from "@/ui/actions/sede/sede.actions";
import {
    createSolicitudLocalAction,
    getAllSolicitudesPrestamoAction,
    updateSolicitudEstadoAction
} from "@/ui/actions/solicitud-prestamo/solicitud-prestamo.actions";
import { localDateISO } from "@/ui/forms/handlers/local-date";
import { type ReadField, type ReadFieldValues } from "@/ui/forms/handlers/read-form";
import { useMultipleSelector, useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { pickData } from "@/ui/routes/use-library-records-viewmodel";

export type ModuloBandeja = "Solicitudes de préstamo" | "Remitos" | "Préstamos" | "Reservas" | "Avisos";
export type DestinoBandeja = { modulo: ModuloBandeja; id: string };

export type AccionInline = {
    label: string;
    tone?: "primary";
    execute: () => Promise<ActionState<unknown>>;
};

export type Pendiente = DestinoBandeja & {
    label: string;
    detalle: string;
    sedeId: string;
    accion?: AccionInline;
};

type Grupo = { titulo: string; items: ActionState<Pendiente[]> };
type Busqueda = { criterio: CriterioMostrador; valor: string; sedeId: string };

function fechaTexto(fecha?: string | Date | null) {
    return fecha instanceof Date ? fecha.toISOString().slice(0, 10) : fecha?.slice(0, 10) ?? "";
}

export async function getPendientes(session: Session, sedeId: string): Promise<Grupo[]> {
    const proximos = new Date();
    proximos.setDate(proximos.getDate() + 3);
    const hoy = localDateISO();
    const hasta = localDateISO(proximos);
    const getRemitos = async (estados: EstadoEnvio[], origen: boolean): Promise<ActionState<Pendiente[]>> => {
        const resultados = await Promise.all(estados.map((estado) => getAllRemitosAction({
            session, estado,
            ...(origen ? { sede_origen_id: sedeId } : { sede_destino_id: sedeId })
        })));
        const error = resultados.find(({ success }) => !success);
        if (error) return { success: false, error: error.error };
        return {
            success: true,
            data: resultados.flatMap(({ data }, indice) => (data?.remitos ?? []).map((remito) => {
                const estadoActual = estados[indice];
                let accion: AccionInline | undefined;
                if (origen && estadoActual === EstadoEnvio.ACEPTADO) {
                    accion = {
                        label: "Empacar",
                        tone: "primary",
                        execute: () => registrarEmpaqueRemitoAction(remito.id, session)
                    };
                } else if (origen && estadoActual === EstadoEnvio.EMPACADO) {
                    accion = {
                        label: "Despachar",
                        tone: "primary",
                        execute: () => registrarDespachoRemitoAction({ session, id: remito.id, fechaDespacho: hoy })
                    };
                } else if (!origen && (estadoActual === EstadoEnvio.DESPACHADO || estadoActual === EstadoEnvio.EN_TRANSITO)) {
                    accion = {
                        label: "Recibir OK",
                        tone: "primary",
                        execute: () => registrarRecepcionRemitoAction({ session, id: remito.id, fechaRecepcion: hoy, conIncidencia: false })
                    };
                }
                return {
                    modulo: "Remitos" as const,
                    id: remito.id,
                    label: remito.numero,
                    sedeId: origen ? remito.sedeOrigenId : remito.sedeDestinoId,
                    detalle: remito.diasTransito == null ? estadoActual.name
                        : `${estadoActual.name} · ${remito.diasTransito} días en tránsito`,
                    accion
                };
            }))
        };
    };

    const [solicitudes, despachos, recepciones, prestamos, reservas] = await Promise.all([
        getAllSolicitudesPrestamoAction({ session, estado: EstadoSolicitud.PENDIENTE, sedeId }),
        getRemitos([EstadoEnvio.ACEPTADO, EstadoEnvio.EMPACADO], true),
        getRemitos([EstadoEnvio.EN_TRANSITO, EstadoEnvio.DESPACHADO, EstadoEnvio.CON_INCIDENCIA], false),
        getAllPrestamosAction({ session, estado: EstadoPrestamo.ACTIVO, sede_id: sedeId }),
        getAllReservasAction({ session, estado: EstadoReserva.LISTA_PARA_RETIRO, sedeId })
    ]);

    return [
        {
            titulo: "Solicitudes por aprobar",
            items: pickData(solicitudes, (items) => items
                .filter(({ sedeOrigenId }) => !sedeId || sedeOrigenId === sedeId)
                .map((solicitud) => ({
                    modulo: "Solicitudes de préstamo", id: solicitud.id,
                    label: solicitud.numero, detalle: solicitud.tipoName, sedeId: solicitud.sedeOrigenId,
                    accion: {
                        label: solicitud.tipo === TipoPrestamo.LOCAL ? "Aprobar (Domicilio)" : "Aprobar",
                        tone: "primary",
                        execute: () => updateSolicitudEstadoAction({
                            session,
                            id: solicitud.id,
                            estado: EstadoSolicitud.APROBADA,
                            ...(solicitud.tipo === TipoPrestamo.LOCAL ? { modalidad: ModalidadPrestamoLocal.DOMICILIO } : {})
                        })
                    }
                })))
        },
        { titulo: "Remitos para empacar o despachar", items: despachos },
        { titulo: "Remitos por recibir", items: recepciones },
        {
            titulo: "Préstamos que vencen en los próximos 3 días",
            items: pickData(prestamos, ({ prestamos: items }) => items
                .filter(({ fechaVencimiento }) => fechaTexto(fechaVencimiento) >= hoy && fechaTexto(fechaVencimiento) <= hasta)
                .sort((a, b) => fechaTexto(a.fechaVencimiento).localeCompare(fechaTexto(b.fechaVencimiento)))
                .map((prestamo) => ({
                    modulo: "Préstamos", id: prestamo.id,
                    sedeId: prestamo.sedeId,
                    label: `Préstamo #${prestamo.id}`, detalle: `Vence el ${fechaTexto(prestamo.fechaVencimiento)}`,
                    accion: prestamo.modalidadEntity === ModalidadPrestamoLocal.DOMICILIO ? {
                        label: "Renovar",
                        execute: () => renovarPrestamoAction({ id: prestamo.id, session })
                    } : undefined
                })))
        },
        {
            titulo: "Reservas listas para retirar",
            items: pickData(reservas, (items) => items
                .filter(({ fechaLimiteRetiro }) => !fechaLimiteRetiro || fechaTexto(fechaLimiteRetiro) >= hoy)
                .map((reserva) => ({
                    modulo: "Reservas", id: reserva.id, label: `Reserva #${reserva.id}`, sedeId: reserva.sedeId,
                    detalle: reserva.fechaLimiteRetiro
                        ? `Retiro hasta el ${fechaTexto(reserva.fechaLimiteRetiro)}` : reserva.estadoName,
                    accion: {
                        label: "Entregar",
                        tone: "primary",
                        execute: () => updateReservaEstadoAction({ session, id: reserva.id, estado: EstadoReserva.RETIRADA })
                    }
                })))
        }
    ];
}

export function useViewModel(session: Session) {
    const recepcionista = session.user?.roleEntity === Rol.RECEPCIONISTA;
    const [sedeSeleccionada, setSedeSeleccionada] = useState("");
    const [sedes, setSedes] = useState<ActionState<Sede[]> | null>(null);
    const [revision, setRevision] = useState(0);
    const [bandeja, setBandeja] = useState<{ sedeId: string; revision: number; grupos: Grupo[] } | null>(null);
    const [avisos, setAvisos] = useState<ActionState<Aviso[]> | null>(null);
    const [busqueda, setBusqueda] = useState<Busqueda | null>(null);
    const [resultado, setResultado] = useState<{ busqueda: Busqueda; data: ActionState<MostradorResultado> } | null>(null);
    const [feedback, setFeedback] = useState<ActionState<unknown> | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [prestamoRapidoAbierto, setPrestamoRapidoAbierto] = useState(false);

    const sedeId = recepcionista ? session.user?.sedeId ?? "" : sedeSeleccionada;
    const catalog = useSelectorCatalog(session, "socios", "ejemplares");
    const socioSelector = useSelector("socioId", "Socio", "Buscá por nombre o DNI");
    const ejemplaresSelector = useMultipleSelector("ejemplaresIds", "Ejemplares disponibles", "Buscá por título o código");

    useEffect(() => {
        let active = true;
        void getAllSedesAction({ session }).then((result) => {
            if (active) setSedes(result);
        });
        return () => { active = false; };
    }, [session, revision]);

    useEffect(() => {
        if (recepcionista && !sedeId) return;
        let active = true;
        void getPendientes(session, sedeId).then((grupos) => {
            if (active) setBandeja({ sedeId, revision, grupos });
        });
        void getAllAvisosAction({ session }).then((result) => {
            if (active) setAvisos(result);
        });
        return () => { active = false; };
    }, [session, sedeId, recepcionista, revision]);

    useEffect(() => {
        if (!busqueda || busqueda.sedeId !== sedeId) return;
        let active = true;
        void buscarMostradorCompletoAction(session, sedeId, busqueda.criterio, busqueda.valor).then((data) => {
            if (active) setResultado({ busqueda, data });
        });
        return () => { active = false; };
    }, [session, sedeId, busqueda, revision]);

    const refresh = () => {
        catalog.refresh();
        setRevision((current) => current + 1);
    };

    const runAction = async (key: string, action: () => Promise<ActionState<unknown>>) => {
        setBusyId(key);
        setFeedback(null);
        const res = await action();
        setBusyId(null);
        setFeedback(res);
        if (res.success) refresh();
        return res;
    };

    const buscar = (field: ReadField) => {
        const criterio = (field("criterio") || "auto") as CriterioMostrador;
        setFeedback(null);
        setBusqueda({ criterio, valor: field("valor"), sedeId });
    };

    const buscarEnSede = (id: string) => {
        setSedeSeleccionada(id);
        setBusqueda(null);
        setFeedback(null);
    };

    const prestarRapido = async (field: ReadField, values: ReadFieldValues): Promise<ActionState<unknown>> => {
        const sedeOrigenId = sedeId || field("sedeOrigenId");
        const socioId = field("socioId");
        const ejemplaresIds = values("ejemplaresIds").filter(Boolean);
        const modalidad = ModalidadPrestamoLocal.fromString(field("modalidad"));
        if (!sedeOrigenId) return { success: false, error: "Seleccioná una sede antes de registrar un préstamo." };
        if (!socioId || !ejemplaresIds.length) return { success: false, error: "Seleccioná un socio y al menos un ejemplar." };

        const creada = await createSolicitudLocalAction({ session, socioId, sedeOrigenId, ejemplaresIds });
        if (!creada.success || !creada.data?.id) {
            setFeedback(creada);
            return creada;
        }
        const aprobada = await updateSolicitudEstadoAction({
            session,
            id: creada.data.id,
            estado: EstadoSolicitud.APROBADA,
            modalidad
        });
        setFeedback(aprobada);
        if (aprobada.success) {
            socioSelector.reset();
            ejemplaresSelector.reset();
            setPrestamoRapidoAbierto(false);
            refresh();
        }
        return aprobada;
    };

    const copiasDisponibles = catalog.ejemplares
        ? pickData(catalog.ejemplares, (items) =>
            items.filter((copy) => copy.estado === EstadoCopia.DISPONIBLE && (!sedeId || copy.sedeId === sedeId))
        )
        : null;

    const avisosSinLeer: ActionState<Aviso[]> | null = avisos
        ? pickData(avisos, (items) => items.filter((a) => !a.leido && (!sedeId || !a.sedeId || a.sedeId === sedeId)))
        : null;

    const sedeNombre = sedes?.data?.find(({ id }) => id === sedeId)?.nombre;
    const resultadoActual = resultado?.busqueda === busqueda ? resultado.data : null;

    return {
        sedeId,
        sedeNombre,
        recepcionista,
        sedes,
        grupos: bandeja?.sedeId === sedeId ? bandeja.grupos : null,
        avisosSinLeer,
        buscando: Boolean(busqueda && resultado?.busqueda !== busqueda),
        mostrador: resultadoActual,
        feedback,
        busyId,
        prestamoRapidoAbierto,
        togglePrestamoRapido: () => {
            setPrestamoRapidoAbierto((v) => !v);
            catalog.refresh();
        },
        socioField: socioSelector.field(catalog.socios ?? null),
        ejemplaresField: ejemplaresSelector.field(copiasDisponibles ?? null, "Cargando ejemplares..."),
        prestarRapido,
        ejecutarAccion: (key: string, fn: () => Promise<ActionState<unknown>>) => void runAction(key, fn),
        devolverRapido: (prestamoId: string, ejemplarId?: string) => void runAction(
            `devolver-${prestamoId}-${ejemplarId ?? "all"}`,
            () => createDevolucionAction({
                session,
                prestamoId,
                ejemplarId,
                fecha: localDateISO(),
                estadoDevuelto: EstadoEjemplar.DISPONIBLE
            })
        ),
        pagarMultaRapido: (multaId: string) => void runAction(
            `multa-${multaId}`,
            () => pagarMultaAction(multaId, localDateISO(), session)
        ),
        entregarReservaRapido: (reservaId: string) => void runAction(
            `reserva-${reservaId}`,
            () => updateReservaEstadoAction({ session, id: reservaId, estado: EstadoReserva.RETIRADA })
        ),
        marcarAvisoLeido: (avisoId: string) => void runAction(
            `aviso-${avisoId}`,
            () => marcarAvisoLeidoAction({ id: avisoId, session })
        ),
        buscar,
        buscarEnSede,
        refresh
    };
}
