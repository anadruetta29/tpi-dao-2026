import React, { useCallback, useEffect, useState } from "react";
import { Prestamo, EstadoPrestamo } from "@/domain/entities/prestamo";
import { useAuth } from "@/ui/hooks/use-auth";
import { getAllPrestamosAction } from "@/ui/actions/prestamo/prestamo.actions";

export interface PrestamosListSectionProps {
    onCreateClick?: () => void;
    onSelectPrestamo?: (prestamo: Prestamo) => void;
}

export const PrestamosListSection: React.FC<PrestamosListSectionProps> = ({
    onCreateClick,
    onSelectPrestamo
}) => {
    const { session } = useAuth();
    const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [socioIdFilter, setSocioIdFilter] = useState<string>("");
    const [sedeIdFilter, setSedeIdFilter] = useState<string>("");
    const [estadoFilter, setEstadoFilter] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadPrestamos = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const result = await getAllPrestamosAction({
            session,
            socio_id: socioIdFilter.trim() || null,
            sede_id: sedeIdFilter.trim() || null,
            estado: estadoFilter || null
        });

        if (result.success && result.data) {
            setPrestamos(result.data.prestamos);
            setTotal(result.data.total);
        } else {
            setError(result.error || "No se pudieron cargar los préstamos.");
        }

        setIsLoading(false);
    }, [session, socioIdFilter, sedeIdFilter, estadoFilter]);

    useEffect(() => {
        void loadPrestamos();
    }, [loadPrestamos]);

    const formatDate = (value?: string | Date | null): string => {
        if (!value) return "—";
        return value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
    };

    return (
        <section style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <h2 style={{ margin: 0 }}>Préstamos ({total})</h2>
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
                        Efectivizar préstamo
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
                <input
                    type="text"
                    placeholder="ID de Sede..."
                    value={sedeIdFilter}
                    onChange={(e) => setSedeIdFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
                <select
                    aria-label="Filtrar por estado"
                    value={estadoFilter}
                    onChange={(e) => setEstadoFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                >
                    <option value="">Todos los estados</option>
                    {EstadoPrestamo.toOptions().map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => void loadPrestamos()}
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

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "0.75rem" }}>ID</th>
                            <th style={{ padding: "0.75rem" }}>Fecha Inicio</th>
                            <th style={{ padding: "0.75rem" }}>Fecha Vencimiento</th>
                            <th style={{ padding: "0.75rem" }}>Fecha Devolución</th>
                            <th style={{ padding: "0.75rem" }}>Modalidad</th>
                            <th style={{ padding: "0.75rem" }}>Estado</th>
                            {onSelectPrestamo && <th style={{ padding: "0.75rem" }}>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {prestamos.length === 0 && !isLoading ? (
                            <tr>
                                <td colSpan={onSelectPrestamo ? 7 : 6} style={{ padding: "1rem", textAlign: "center", color: "#6b7280" }}>
                                    No se encontraron préstamos.
                                </td>
                            </tr>
                        ) : (
                            prestamos.map((prestamo) => (
                                <tr key={prestamo.id || `${prestamo.fechaInicio}-${prestamo.fechaVencimiento}`} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    <td style={{ padding: "0.75rem" }}>{prestamo.id}</td>
                                    <td style={{ padding: "0.75rem" }}>{formatDate(prestamo.fechaInicio)}</td>
                                    <td style={{ padding: "0.75rem" }}>{formatDate(prestamo.fechaVencimiento)}</td>
                                    <td style={{ padding: "0.75rem" }}>{formatDate(prestamo.fechaDevolucion)}</td>
                                    <td style={{ padding: "0.75rem" }}>{prestamo.modalidadName}</td>
                                    <td style={{ padding: "0.75rem" }}>{prestamo.estadoName}</td>
                                    {onSelectPrestamo && (
                                        <td style={{ padding: "0.75rem" }}>
                                            <button
                                                type="button"
                                                onClick={() => onSelectPrestamo(prestamo)}
                                                style={{
                                                    padding: "0.35rem 0.7rem",
                                                    borderRadius: "6px",
                                                    border: "1px solid #2563eb",
                                                    backgroundColor: "transparent",
                                                    color: "#2563eb",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Ver detalle
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
