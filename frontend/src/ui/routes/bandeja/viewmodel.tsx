import { useEffect, useRef, useState, type FormEvent } from "react";
import { type ActionState, type Busqueda, type Grupo, type DestinoBandeja } from "@/core/types";
import { type Aviso } from "@/domain/entities/aviso";
import { EstadoEjemplar } from "@/domain/entities/devolucion";
import { EstadoEjemplar as EstadoCopia } from "@/domain/entities/ejemplar";
import { EstadoReserva } from "@/domain/entities/estado-reserva";
import { EstadoPrestamo } from "@/domain/entities/prestamo";
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
import { readForm, type ReadField, type ReadFieldValues } from "@/ui/forms/handlers/read-form";
import { useMultipleSelector, useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { pickData, type Field } from "@/ui/routes/use-library-records-viewmodel";
import { getPendientes } from "@/core/utils/get-pendientes";
import { ModalidadPrestamoLocal } from "@/domain/entities/modalidad-prestamo-local";
import { updateReservaEstadoAction } from "@/ui/actions/reserva/reserva.actions";


import { statusBadge, type StatusBadgeView } from "@/ui/components/library-records/viewmodel";

export type DeskAction = { label: string; accessibleLabel?: string; run: () => void; loading?: boolean; tone?: "primary" | "secondary" | "danger" };
export type DeskRow = { id: string; label: string; detail?: string; badge?: StatusBadgeView; actions: DeskAction[] };
type DeskGroup = { label: string; tone: "primary" | "success" | "danger"; rows: DeskRow[] };

const criterios = [
    { value: "auto", label: "Detectar automáticamente" },
    { value: "dni", label: "DNI del socio" },
    { value: "codigo", label: "Código de ejemplar" },
    { value: "prestamo", label: "Número de préstamo" }
];

export function useViewModel(session: Session, onOpen: (target: DestinoBandeja) => void, onDevolver: (id: string) => void) {
    const recepcionista = session.user?.roleEntity === Rol.RECEPCIONISTA;
    const [sedeSeleccionada, setSedeSeleccionada] = useState("");
    const [sedes, setSedes] = useState<ActionState<Sede[]> | null>(null);
    const [revision, setRevision] = useState(0);
    const [bandeja, setBandeja] = useState<{ sedeId: string; revision: number; grupos: Grupo[] } | null>(null);
    const [avisos, setAvisos] = useState<ActionState<Aviso[]> | null>(null);
    const [busqueda, setBusqueda] = useState<Busqueda | null>(null);
    const [searchRevision, setSearchRevision] = useState(0);
    const [resultado, setResultado] = useState<{ busqueda: Busqueda; data: ActionState<MostradorResultado> } | null>(null);
    const [feedback, setFeedback] = useState<ActionState<unknown> | null>(null);
    const [busyIds, setBusyIds] = useState<Set<string>>(() => new Set());
    const running = useRef(new Set<string>());
    const [prestamoRapidoAbierto, setPrestamoRapidoAbierto] = useState(false);
    const [savingQuick, setSavingQuick] = useState(false);
    const quickInFlight = useRef(false);
    const pendingApprovals = useRef(new Map<string, string>());

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
        if (running.current.has(key)) return;
        running.current.add(key);
        setBusyIds(new Set(running.current));
        setFeedback(null);
        try {
            const result = await action();
            setFeedback(result);
            if (result.success) refresh();
        } finally {
            running.current.delete(key);
            setBusyIds(new Set(running.current));
        }
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

    const clearSearch = () => {
        setBusqueda(null);
        setResultado(null);
        setFeedback(null);
        setSearchRevision((current) => current + 1);
    };

    const prestarRapido = async (field: ReadField, values: ReadFieldValues): Promise<ActionState<unknown>> => {
        const sedeOrigenId = sedeId || field("sedeOrigenId");
        const socioId = field("socioId");
        const ejemplaresIds = values("ejemplaresIds").filter(Boolean);
        const modalidad = ModalidadPrestamoLocal.fromString(field("modalidad"));
        if (quickInFlight.current) return { success: false };
        if (!sedeOrigenId || !socioId || !ejemplaresIds.length) {
            const result = { success: false, error: !sedeOrigenId
                ? "Seleccioná una sede antes de registrar un préstamo."
                : "Seleccioná un socio y al menos un ejemplar." };
            setFeedback(result);
            return result;
        }

        quickInFlight.current = true;
        setSavingQuick(true);
        setFeedback(null);
        try {
            const key = JSON.stringify([sedeOrigenId, socioId, [...ejemplaresIds].sort()]);
            let approvalId = pendingApprovals.current.get(key);
            if (!approvalId) {
                const creada = await createSolicitudLocalAction({ session, socioId, sedeOrigenId, ejemplaresIds });
                if (!creada.success || !creada.data?.id) {
                    setFeedback(creada.success ? { success: false, error: "La solicitud se creó sin una referencia para aprobarla." } : creada);
                    return creada;
                }
                approvalId = creada.data.id;
                pendingApprovals.current.set(key, approvalId);
            }
            const approved = await updateSolicitudEstadoAction({
                session, id: approvalId, estado: EstadoSolicitud.APROBADA, modalidad
            });
            setFeedback(approved);
            if (approved.success) {
                pendingApprovals.current.delete(key);
                socioSelector.reset();
                ejemplaresSelector.reset();
                setPrestamoRapidoAbierto(false);
                refresh();
            }
            return approved;
        } finally {
            quickInFlight.current = false;
            setSavingQuick(false);
        }
    };

    const copiasDisponibles = catalog.ejemplares
        ? pickData(catalog.ejemplares, (items) =>
            items.filter((copy) => copy.estado === EstadoCopia.DISPONIBLE && (!sedeId || copy.sedeId === sedeId))
        )
        : null;

    const avisosSinLeer: ActionState<Aviso[]> | null = avisos
        ? pickData(avisos, (items) => items.filter((a) => !a.leido && (!sedeId || !a.sedeId || a.sedeId === sedeId)))
        : null;


    const sedeNames = new Map((sedes?.data ?? []).map(({ id, nombre }) => [id, nombre]));
    const sedeLabel = (id: string) => sedeNames.get(id) ?? `Sede #${id}`;
    const sedeOptions = [{ value: "", label: "Todas las sedes" }, ...(sedes?.data ?? []).map(({ id, nombre }) => ({ value: id, label: nombre }))];
    const current = resultado?.busqueda === busqueda ? resultado.data : null;
    const search = current?.data;
    const open = (label: string, target: DestinoBandeja): DeskAction => ({ label, run: () => onOpen(target) });
    const action = (key: string, label: string, execute: () => Promise<ActionState<unknown>>, tone: DeskAction["tone"] = "primary"): DeskAction => ({
        label, tone, loading: busyIds.has(key), run: () => void runAction(key, execute)
    });

    const groups: DeskGroup[] = search ? [
        {
            label: "Multas pendientes", tone: "danger",
            rows: search.multasPendientes.map((multa) => ({
                id: multa.id, label: `Multa #${multa.id} · $${multa.monto}`,
                detail: `${multa.motivoName} · Préstamo #${multa.prestamoId}`,
                actions: [action(`multa-${multa.id}`, "Registrar pago", () => pagarMultaAction(multa.id, localDateISO(), session))]
            }))
        },
        {
            label: "Reservas listas para entregar", tone: "success",
            rows: search.reservasListas.map((reserva) => ({
                id: reserva.id, label: `Reserva #${reserva.id}`,
                detail: [ `Ejemplar #${reserva.ejemplarId}`, reserva.fechaLimiteRetiro && `Retiro hasta ${String(reserva.fechaLimiteRetiro).slice(0, 10)}` ].filter(Boolean).join(" · "),
                actions: [
                    open("Ver reserva", { modulo: "Reservas", id: reserva.id }),
                    action(`reserva-${reserva.id}`, "Entregar", () => updateReservaEstadoAction({ session, id: reserva.id, estado: EstadoReserva.RETIRADA }))
                ]
            }))
        },
        {
            label: "Préstamos pendientes de devolución", tone: "primary",
            rows: search.prestamos.map((prestamo) => {
                const pendientes = prestamo.ejemplaresIds.filter((id) => !prestamo.ejemplaresDevueltosIds.includes(id));
                const ejemplarId = search.ejemplarIdBuscado ?? (pendientes.length <= 1 ? pendientes[0] : undefined);
                return {
                    id: prestamo.id, label: `Préstamo #${prestamo.id}`,
                    detail: prestamo.sedeId ? sedeLabel(prestamo.sedeId) : undefined,
                    badge: statusBadge(prestamo.estadoName, prestamo.estadoEntity === EstadoPrestamo.ACTIVO ? "active" : undefined),
                    actions: [
                        open("Ver préstamo", { modulo: "Préstamos", id: prestamo.id }),
                        ...(pendientes.length <= 1 || search.ejemplarIdBuscado ? [action(
                            `devolver-${prestamo.id}-${ejemplarId ?? "all"}`, "Devolver hoy", () => createDevolucionAction({
                                session, prestamoId: prestamo.id, ejemplarId, fecha: localDateISO(), estadoDevuelto: EstadoEjemplar.DISPONIBLE
                            })
                        )] : []),
                        { label: "Registrar devolución", run: () => onDevolver(prestamo.id) }
                    ]
                };
            })
        }
    ] : [];

    const notices = (avisosSinLeer?.data ?? []).slice(0, 5).map((aviso): DeskRow => ({
        id: aviso.id, label: aviso.tipoName, detail: aviso.mensaje, badge: statusBadge("Nuevo"),
        actions: [
            ...(aviso.reservaId ? [open("Ver reserva", { modulo: "Reservas", id: aviso.reservaId })] : []),
            ...(aviso.prestamoId ? [open("Ver préstamo", { modulo: "Préstamos", id: aviso.prestamoId })] : []),
            action(`aviso-${aviso.id}`, "Marcar leído", () => marcarAvisoLeidoAction({ id: aviso.id, session }), "secondary")
        ]
    }));

    const quickForm = {
        label: "Prestar ahora",
        isSaving: savingQuick,
        submitDisabled: !socioSelector.selected || ejemplaresSelector.selected.length === 0,
        fields: [
            ...(!sedeId ? [{ name: "sedeOrigenId", label: "Sede", options: sedeOptions.slice(1) }] : []),
            socioSelector.field(catalog.socios ?? null),
            ejemplaresSelector.field(copiasDisponibles ?? null, "Cargando ejemplares..."),
            { name: "modalidad", label: "Modalidad", options: ModalidadPrestamoLocal.toOptions() }
        ] satisfies Field[],
        onSubmit: (event: FormEvent<HTMLFormElement>) => readForm(event, prestarRapido)
    };
    const searching = Boolean(busqueda && resultado?.busqueda !== busqueda);

    return {
        branchName: recepcionista && sedeId ? sedeLabel(sedeId) : undefined,
        branchField: recepcionista ? undefined : { name: "sede", label: "Sede", options: sedeOptions, onChange: buscarEnSede },
        error: (sedes && !sedes.success && !recepcionista) ? sedes.error || "No se pudieron cargar las sedes." : undefined,
        noBranch: recepcionista && !sedeId,
        feedback: feedback ? {
            kind: feedback.success ? "success" as const : "error" as const,
            text: feedback.success ? feedback.message || "Operación realizada correctamente." : feedback.error || "No se pudo completar la operación."
        } : null,
        refresh,
        quick: prestamoRapidoAbierto,
        savingQuick,
        quickToggle: () => {
            if (quickInFlight.current) return;
            setPrestamoRapidoAbierto((value) => !value);
            if (!prestamoRapidoAbierto) catalog.refresh();
        },
        quickForm,
        searchForm: {
            label: "Buscar préstamo",
            savingLabel: "Buscando...",
            isSaving: searching,
            revision: searchRevision,
            onClear: busqueda ? clearSearch : undefined,
            clearLabel: "Limpiar búsqueda",
            fields: [
                { name: "criterio", label: "Buscar por", options: criterios },
                { name: "valor", label: "Dato de búsqueda", placeholder: "DNI, código de ejemplar o #préstamo", required: true }
            ] satisfies Field[],
            onSubmit: (event: FormEvent<HTMLFormElement>) => readForm(event, buscar)
        },
        searching,
        searchError: current && !current.success ? current.error || "No se pudo realizar la búsqueda." : null,
        member: search?.socio ? {
            name: `${search.socio.nombre} ${search.socio.apellido}`.trim(),
            initials: (search.socio.nombre.charAt(0) + search.socio.apellido.charAt(0)).toUpperCase(),
            document: `DNI ${search.socio.documento}`,
            badge: statusBadge(search.socio.estadoName)
        } : null,
        searchGroups: groups.filter(({ rows }) => rows.length > 0),
        searchEmpty: Boolean(search && groups.every(({ rows }) => rows.length === 0)),
        notices, unreadCount: avisosSinLeer?.data?.length ?? 0,
        queue: bandeja?.sedeId === sedeId ? bandeja.grupos.map(({ titulo, items }) => ({
            label: titulo,
            error: !items.success ? items.error || "No se pudieron cargar los pendientes." : null,
            rows: (items.data ?? []).map((item): DeskRow => ({
                id: `${item.modulo}-${item.id}`, label: item.label,
                detail: [item.detalle, !sedeId && item.sedeId ? sedeLabel(item.sedeId) : ""].filter(Boolean).join(" · "),
                actions: [
                    ...(item.accion ? [action(`${titulo}-${item.id}`, item.accion.label, item.accion.execute, item.accion.tone ?? "secondary")] : []),
                    { ...open("Abrir", item), accessibleLabel: `Abrir ${item.label}` }
                ]
            }))
        })) : null
    };
}
