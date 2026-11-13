import React, { useState } from "react";
import { type ActionState } from "@/core/types";
import { type Multa } from "@/domain/entities/multa";
import { type Prestamo } from "@/domain/entities/prestamo";
import { type Session } from "@/domain/entities/session";
import { getSocioMultasAction, getSocioPrestamosAction } from "@/ui/actions/socio/socio.actions";
import { libraryButtonStyle, libraryControlsStyle } from "@/ui/components/library-records/library-records.styles";

interface SocioHistoryProps {
    id: string;
    session: Session;
}

export const SocioHistory: React.FC<SocioHistoryProps> = ({ id, session }) => {
    const [prestamos, setPrestamos] = useState<ActionState<Prestamo[]> | null>(null);
    const [multas, setMultas] = useState<ActionState<Multa[]> | null>(null);
    const [loading, setLoading] = useState<"prestamos" | "multas" | null>(null);
    const [selected, setSelected] = useState<"prestamos" | "multas" | null>(null);

    const load = async (history: "prestamos" | "multas") => {
        setSelected(history);
        setLoading(history);
        if (history === "prestamos") {
            setPrestamos(await getSocioPrestamosAction({ session, id }));
        } else {
            setMultas(await getSocioMultasAction({ session, id }));
        }
        setLoading(null);
    };

    const result = selected === "prestamos" ? prestamos : multas;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={libraryControlsStyle}>
                <button type="button" style={libraryButtonStyle} disabled={Boolean(loading)} onClick={() => void load("prestamos")}>
                    Ver préstamos
                </button>
                <button type="button" style={libraryButtonStyle} disabled={Boolean(loading)} onClick={() => void load("multas")}>
                    Ver multas
                </button>
            </div>
            {loading && <p role="status">Cargando historial...</p>}
            {!loading && result && !result.success && <p role="alert">{result.error}</p>}
            {!loading && result?.data?.length === 0 && <p>No hay registros en el historial.</p>}
            {!loading && selected === "prestamos" && !!prestamos?.data?.length && (
                <ul>
                    {prestamos.data.map((prestamo) => (
                        <li key={prestamo.id}>
                            <strong>Préstamo {prestamo.id} · {prestamo.estadoName}</strong>
                            <div>Modalidad: {prestamo.modalidadName}</div>
                            <div>Inicio: {String(prestamo.fechaInicio ?? "—")} · Vencimiento: {String(prestamo.fechaVencimiento ?? "—")}</div>
                            <div>Devolución: {String(prestamo.fechaDevolucion ?? "—")}</div>
                            <div>Sede: {prestamo.sedeId || "—"} · Ejemplar: {prestamo.ejemplarId || "—"}</div>
                        </li>
                    ))}
                </ul>
            )}
            {!loading && selected === "multas" && !!multas?.data?.length && (
                <ul>
                    {multas.data.map((multa) => (
                        <li key={multa.id}>
                            <strong>Multa {multa.id} · {multa.estadoName}</strong>
                            <div>{multa.motivoName} · Monto: {multa.monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</div>
                            <div>Emisión: {String(multa.fechaEmision ?? "—")} · Pago: {String(multa.fechaPago ?? "—")}</div>
                            <div>Préstamo: {multa.prestamoId || "—"}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
