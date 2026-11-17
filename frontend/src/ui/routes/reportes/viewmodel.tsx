import { useEffect, useState } from "react";
import { type ActionState } from "@/core/types";
import { localDateISO } from "@/ui/forms/handlers/local-date";
import { type Sede } from "@/domain/entities/sede";
import { type Session } from "@/domain/entities/session";
import { type LibrosInterbibliotecariosReport } from "@/domain/reports/libros-interbibliotecarios-report";
import { type LogisticaIncidenciasReport } from "@/domain/reports/logistica-incidencias-report";
import { type MovimientoSedesReport } from "@/domain/reports/movimiento-sedes-report";
import { type PrestamosVencidosMultasReport } from "@/domain/reports/prestamos-vencidos-multas-report";
import {
    getLibrosInterbibliotecariosReportAction,
    getLogisticaIncidenciasReportAction,
    getMovimientoSedesReportAction,
    getPrestamosVencidosMultasReportAction
} from "@/ui/actions/report/report.actions";
import { getAllSedesAction } from "@/ui/actions/sede/sede.actions";

export type ReportTab = "movimiento" | "logistica" | "morosidad" | "demanda";

export const reportTabs: { id: ReportTab; label: string; description: string }[] = [
    {
        id: "movimiento",
        label: "Movimiento entre sedes",
        description: "Envíos agrupados por ruta origen/destino y tiempos de tránsito."
    },
    {
        id: "logistica",
        label: "Envíos e incidencias",
        description: "Tasa de entregas exitosas, incidencias por estado y desempeño por sede."
    },
    {
        id: "morosidad",
        label: "Vencidos y multas",
        description: "Préstamos con atraso, deuda pendiente y multas acumuladas por motivo."
    },
    {
        id: "demanda",
        label: "Libros inter-sedes",
        description: "Ranking de títulos más solicitados entre sedes y tasa de aprobación."
    }
];

export function useViewModel(session: Session) {
    const today = localDateISO();
    const [tab, setTab] = useState<ReportTab>("movimiento");
    const [revision, setRevision] = useState(0);
    const [filterRevision, setFilterRevision] = useState(0);
    const [sedes, setSedes] = useState<ActionState<Sede[]> | null>(null);

    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [sedeOrigenId, setSedeOrigenId] = useState("");
    const [sedeDestinoId, setSedeDestinoId] = useState("");
    const [sedeMorosidadId, setSedeMorosidadId] = useState("");

    const [movimiento, setMovimiento] = useState<{ key: string; state: ActionState<MovimientoSedesReport> } | null>(null);
    const [logistica, setLogistica] = useState<{ key: string; state: ActionState<LogisticaIncidenciasReport> } | null>(null);
    const [morosidad, setMorosidad] = useState<{ key: string; state: ActionState<PrestamosVencidosMultasReport> } | null>(null);
    const [demanda, setDemanda] = useState<{ key: string; state: ActionState<LibrosInterbibliotecariosReport> } | null>(null);

    const requestKey = `${tab}|${revision}|${fechaDesde}|${fechaHasta}|${sedeOrigenId}|${sedeDestinoId}|${sedeMorosidadId}`;

    const dateRangeError = (() => {
        if (fechaDesde && fechaDesde > today) return "La fecha desde no puede ser posterior al día actual.";
        if (fechaHasta && fechaHasta > today) return "La fecha hasta no puede ser posterior al día actual.";
        if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) return "La fecha desde no puede ser posterior a la fecha hasta.";
        return null;
    })();

    useEffect(() => {
        let active = true;
        void getAllSedesAction({ session }).then((result) => {
            if (active) setSedes(result);
        });
        return () => { active = false; };
    }, [session]);

    useEffect(() => {
        let active = true;
        if (tab === "movimiento") {
            if (dateRangeError) return () => { active = false; };
            void getMovimientoSedesReportAction({
                session,
                fechaDesde: fechaDesde || null,
                fechaHasta: fechaHasta || null,
                sedeOrigenId: sedeOrigenId || null,
                sedeDestinoId: sedeDestinoId || null
            }).then((state) => { if (active) setMovimiento({ key: requestKey, state }); });
        } else if (tab === "logistica") {
            if (dateRangeError) return () => { active = false; };
            void getLogisticaIncidenciasReportAction({
                session,
                fechaDesde: fechaDesde || null,
                fechaHasta: fechaHasta || null,
                sedeOrigenId: sedeOrigenId || null
            }).then((state) => { if (active) setLogistica({ key: requestKey, state }); });
        } else if (tab === "morosidad") {
            void getPrestamosVencidosMultasReportAction({
                session,
                sedeId: sedeMorosidadId || null
            }).then((state) => { if (active) setMorosidad({ key: requestKey, state }); });
        } else if (tab === "demanda") {
            void getLibrosInterbibliotecariosReportAction({
                session,
                sedeDestinoId: sedeDestinoId || null,
                limit: 20
            }).then((state) => { if (active) setDemanda({ key: requestKey, state }); });
        }
        return () => { active = false; };
    }, [session, tab, requestKey, dateRangeError, fechaDesde, fechaHasta, sedeOrigenId, sedeDestinoId, sedeMorosidadId]);

    const refresh = () => setRevision((c) => c + 1);

    const clearFilters = () => {
        setFechaDesde("");
        setFechaHasta("");
        setSedeOrigenId("");
        setSedeDestinoId("");
        setSedeMorosidadId("");
        setFilterRevision((c) => c + 1);
    };

    const hasFilters = Boolean(fechaDesde || fechaHasta || sedeOrigenId || sedeDestinoId || sedeMorosidadId);

    const sedeOptions = [
        { value: "", label: "Todas las sedes" },
        ...(sedes?.data ?? []).map((s) => ({ value: s.id, label: s.nombre }))
    ];

    const currentTab = reportTabs.find((t) => t.id === tab) ?? reportTabs[0];

    return {
        today,
        filterRevision,
        tab,
        setTab,
        currentTab,
        tabs: reportTabs,
        refresh,
        clearFilters,
        hasFilters,
        sedeOptions,
        filters: {
            fechaDesde,
            setFechaDesde,
            fechaHasta,
            setFechaHasta,
            sedeOrigenId,
            setSedeOrigenId,
            sedeDestinoId,
            setSedeDestinoId,
            sedeMorosidadId,
            setSedeMorosidadId
        },
        movimiento: dateRangeError
            ? { success: false, error: dateRangeError }
            : (movimiento?.key === requestKey ? movimiento.state : null),
        logistica: dateRangeError
            ? { success: false, error: dateRangeError }
            : (logistica?.key === requestKey ? logistica.state : null),
        morosidad: morosidad?.key === requestKey ? morosidad.state : null,
        demanda: demanda?.key === requestKey ? demanda.state : null
    };
}
