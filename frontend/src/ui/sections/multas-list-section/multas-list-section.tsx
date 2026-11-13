import React, { useCallback, useEffect, useState } from "react";
import { Multa, EstadoMulta } from "@/domain/entities/multa";
import { useAuth } from "@/ui/hooks/use-auth";
import {
    anularMultaAction,
    getAllMultasAction,
    pagarMultaAction
} from "@/ui/actions/multa/multa.actions";

export interface MultasListSectionProps {
    onCreateClick?: () => void;
}

export const MultasListSection: React.FC<MultasListSectionProps> = ({
    onCreateClick
}) => {
    const { session } = useAuth();
    const [multas, setMultas] = useState<Multa[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [socioIdFilter, setSocioIdFilter] = useState<string>("");
    const [estadoFilter, setEstadoFilter] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const loadMultas = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const result = await getAllMultasAction({
            session,
            socio_id: socioIdFilter.trim() || null,
            estado: estadoFilter || null
        });

        if (result.success && result.data) {
            setMultas(result.data.multas);
            setTotal(result.data.total);
        } else {
            setError(result.error || "No se pudieron cargar las multas.");
        }

        setIsLoading(false);
    }, [session, socioIdFilter, estadoFilter]);

    useEffect(() => {
        void loadMultas();
    }, [loadMultas]);

    const formatDate = (value?: string | Date | null): string => {
        if (!value) return "—";
        return value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
    };

    const handlePagar = async (multa: Multa) => {
        setError(null);
        setSuccessMessage(null);
        const result = await pagarMultaAction(
            multa.id,
            new Date().toISOString().slice(0, 10),
            session
        );
        if (result.success) {
            setSuccessMessage(result.message || "Pago registrado correctamente.");
            await loadMultas();
        } else {
            setError(result.error || "No se pudo registrar el pago.");
        }
    };

    const handleAnular = async (multa: Multa) => {
        setError(null);
        setSuccessMessage(null);
        const result = await anularMultaAction(multa.id, session);
        if (result.success) {
            setSuccessMessage(result.message || "Multa anulada correctamente.");
            await loadMultas();
        } else {
            setError(result.error || "No se pudo anular la multa.");
        }
    };

    return (
        <section style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <h2 style={{ margin: 0 }}>Multas ({total})</h2>
                {onCreateClick && (
                    <button
                        type="button"
                        onClick={onCreateClick}
                        style={{
                            padding: "0.55rem 1rem",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        Registrar multa
                    </button>
                )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <input
                    type="text"
                    placeholder="ID de Socio..."
                    value={socioIdFilter}
                    onChange={(e) => setSocioIdFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
                <select
                    aria-label="Filtrar por estado de multa"
                    value={estadoFilter}
                    onChange={(e) => setEstadoFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                >
                    <option value="">Todos los estados</option>
                    {EstadoMulta.toOptions().map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => void loadMultas()}
                    disabled={isLoading}
                    style={{ padding: "0.5rem 0.9rem", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer" }}
                >
                    {isLoading ? "Cargando..." : "Filtrar"}
                </button>
            </div>

            {error && (
                <div role="alert" style={{ padding: "0.75rem", borderRadius: "6px", backgroundColor: "#fee2e2", color: "#991b1b" }}>
                    {error}
                </div>
            )}

            {successMessage && (
                <div role="status" style={{ padding: "0.75rem", borderRadius: "6px", backgroundColor: "#dcfce7", color: "#166534" }}>
                    {successMessage}
                </div>
            )}

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "0.75rem" }}>Fecha Emisión</th>
                            <th style={{ padding: "0.75rem" }}>Motivo</th>
                            <th style={{ padding: "0.75rem" }}>Monto</th>
                            <th style={{ padding: "0.75rem" }}>Estado</th>
                            <th style={{ padding: "0.75rem" }}>Fecha Pago</th>
                            <th style={{ padding: "0.75rem" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {multas.length === 0 && !isLoading ? (
                            <tr>
                                <td colSpan={6} style={{ padding: "1rem", textAlign: "center", color: "#6b7280" }}>
                                    No se encontraron multas.
                                </td>
                            </tr>
                        ) : (
                            multas.map((multa) => (
                                <tr key={multa.id || `${multa.fechaEmision}-${multa.monto}`} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    <td style={{ padding: "0.75rem" }}>{formatDate(multa.fechaEmision)}</td>
                                    <td style={{ padding: "0.75rem" }}>{multa.motivoName}</td>
                                    <td style={{ padding: "0.75rem" }}>${multa.monto.toFixed(2)}</td>
                                    <td style={{ padding: "0.75rem" }}>{multa.estadoName}</td>
                                    <td style={{ padding: "0.75rem" }}>{formatDate(multa.fechaPago)}</td>
                                    <td style={{ padding: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                        {multa.estado.value === EstadoMulta.PENDIENTE.value && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => void handlePagar(multa)}
                                                    style={{ padding: "0.35rem 0.7rem", borderRadius: "6px", border: "1px solid #059669", color: "#059669", backgroundColor: "transparent", cursor: "pointer" }}
                                                >
                                                    Registrar pago
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => void handleAnular(multa)}
                                                    style={{ padding: "0.35rem 0.7rem", borderRadius: "6px", border: "1px solid #dc2626", color: "#dc2626", backgroundColor: "transparent", cursor: "pointer" }}
                                                >
                                                    Anular
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
