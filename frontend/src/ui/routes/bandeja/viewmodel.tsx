import { useEffect, useState } from "react";
import { type ActionState, type Busqueda, type Grupo } from "@/core/types";
import { type Aviso } from "@/domain/entities/aviso";
import { EstadoEjemplar } from "@/domain/entities/devolucion";
import { EstadoEjemplar as EstadoCopia } from "@/domain/entities/ejemplar";
import { EstadoReserva } from "@/domain/entities/estado-reserva";
import { EstadoSolicitud } from "@/domain/entities/solicitud-prestamo";
import { Rol } from "@/domain/entities/rol";
import { type Sede } from "@/domain/entities/sede";
import { type Session } from "@/domain/entities/session";
import { getAllAvisosAction, marcarAvisoLeidoAction } from "@/ui/actions/aviso/aviso.actions";
import { createDevolucionAction } from "@/ui/actions/devolucion/devolucion.actions";
import { buscarMostradorCompletoAction, type CriterioMostrador, type MostradorResultado } from "@/ui/actions/mostrador/mostrador.actions";
import { pagarMultaAction } from "@/ui/actions/multa/multa.actions";
import { getAllSedesAction } from "@/ui/actions/sede/sede.actions";
import { createSolicitudLocalAction, updateSolicitudEstadoAction} from "@/ui/actions/solicitud-prestamo/solicitud-prestamo.actions";
import { localDateISO } from "@/ui/forms/handlers/local-date";
import { type ReadField, type ReadFieldValues } from "@/ui/forms/handlers/read-form";
import { useMultipleSelector, useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { pickData } from "@/ui/routes/use-library-records-viewmodel";
import { getPendientes } from "@/core/utils/get-pendientes";
import { ModalidadPrestamoLocal } from "@/domain/entities/modalidad-prestamo-local";
import { updateReservaEstadoAction } from "@/ui/actions/reserva/reserva.actions";


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
