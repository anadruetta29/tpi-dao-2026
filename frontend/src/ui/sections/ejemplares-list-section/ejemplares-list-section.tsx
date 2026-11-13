import React, { useCallback, useEffect, useState } from "react";
import { Ejemplar, EstadoEjemplar } from "@/domain/entities/ejemplar";
import { useAuth } from "@/ui/hooks/use-auth";
import { getAllEjemplaresAction } from "@/ui/actions/ejemplar/ejemplar.actions";

export interface EjemplaresListSectionProps {
    onCreateClick?: () => void;
    onSelectEjemplar?: (ejemplar: Ejemplar) => void;
}

export const EjemplaresListSection: React.FC<EjemplaresListSectionProps> = ({
    onCreateClick,
    onSelectEjemplar
}) => {
    const { session } = useAuth();
    const [ejemplares, setEjemplares] = useState<Ejemplar[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [libroIdFilter, setLibroIdFilter] = useState<string>("");
    const [sedeIdFilter, setSedeIdFilter] = useState<string>("");
    const [estadoFilter, setEstadoFilter] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadEjemplares = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const result = await getAllEjemplaresAction({
            session,
            libro_id: libroIdFilter.trim() || null,
            sede_id: sedeIdFilter.trim() || null,
            estado: estadoFilter || null
        });

        if (result.success && result.data) {
            setEjemplares(result.data.ejemplares);
            setTotal(result.data.total);
        } else {
            setError(result.error || "No se pudieron cargar los ejemplares.");
        }

        setIsLoading(false);
    }, [session, libroIdFilter, sedeIdFilter, estadoFilter]);

    useEffect(() => {
        void loadEjemplares();
    }, [loadEjemplares]);

    return (
        <section style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <h2 style={{ margin: 0 }}>Ejemplares Físicos ({total})</h2>
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
                        Registrar ejemplar
                    </button>
                )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <input
                    type="text"
                    placeholder="ID de Libro..."
                    value={libroIdFilter}
                    onChange={(e) => setLibroIdFilter(e.target.value)}
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
                    {EstadoEjemplar.toOptions().map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => void loadEjemplares()}
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
                            <th style={{ padding: "0.75rem" }}>Código</th>
                            <th style={{ padding: "0.75rem" }}>Estado</th>
                            {onSelectEjemplar && <th style={{ padding: "0.75rem" }}>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {ejemplares.length === 0 && !isLoading ? (
                            <tr>
                                <td colSpan={onSelectEjemplar ? 3 : 2} style={{ padding: "1rem", textAlign: "center", color: "#6b7280" }}>
                                    No se encontraron ejemplares.
                                </td>
                            </tr>
                        ) : (
                            ejemplares.map((ejemplar) => (
                                <tr key={ejemplar.id || ejemplar.codigo} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    <td style={{ padding: "0.75rem" }}>{ejemplar.codigo}</td>
                                    <td style={{ padding: "0.75rem" }}>{ejemplar.estadoName}</td>
                                    {onSelectEjemplar && (
                                        <td style={{ padding: "0.75rem" }}>
                                            <button
                                                type="button"
                                                onClick={() => onSelectEjemplar(ejemplar)}
                                                style={{ padding: "0.35rem 0.7rem", borderRadius: "6px", border: "1px solid #2563eb", color: "#2563eb", backgroundColor: "transparent", cursor: "pointer" }}
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
