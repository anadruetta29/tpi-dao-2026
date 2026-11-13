import React, { useCallback, useEffect, useState } from "react";
import { Remito } from "@/domain/entities/remito";
import { Ejemplar } from "@/domain/entities/ejemplar";
import { EstadoEnvio } from "@/domain/entities/estado-envio";
import { HistorialEstadoRemito } from "@/domain/entities/historial-estado-remito";
import { useAuth } from "@/ui/hooks/use-auth";
import {
    getAllRemitosAction,
    getRemitoByIdAction,
    getTrazabilidadRemitoAction,
    registrarDespachoRemitoAction,
    registrarRecepcionRemitoAction
} from "@/ui/actions/remito/remito.actions";

export interface RemitosListSectionProps {
    onCreateClick?: () => void;
}

export const RemitosListSection: React.FC<RemitosListSectionProps> = ({
    onCreateClick
}) => {
    const { session } = useAuth();
    const [remitos, setRemitos] = useState<Remito[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [sedeOrigenFilter, setSedeOrigenFilter] = useState<string>("");
    const [sedeDestinoFilter, setSedeDestinoFilter] = useState<string>("");
    const [estadoFilter, setEstadoFilter] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<{
        remito: Remito;
        ejemplares: Ejemplar[];
    } | null>(null);
    const [selectedTrazabilidad, setSelectedTrazabilidad] = useState<{
        remito: Remito;
        historial: HistorialEstadoRemito[];
    } | null>(null);

    const loadRemitos = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const result = await getAllRemitosAction({
            session,
            sede_origen_id: sedeOrigenFilter.trim() || null,
            sede_destino_id: sedeDestinoFilter.trim() || null,
            estado: estadoFilter || null
        });

        if (result.success && result.data) {
            setRemitos(result.data.remitos);
            setTotal(result.data.total);
        } else {
            setError(result.error || "No se pudieron cargar los remitos.");
        }

        setIsLoading(false);
    }, [session, sedeOrigenFilter, sedeDestinoFilter, estadoFilter]);

    useEffect(() => {
        void loadRemitos();
    }, [loadRemitos]);

    const formatDate = (value?: string | Date | null): string => {
        if (!value) return "—";
        return value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
    };

    const handleVerDetalle = async (remito: Remito) => {
        setError(null);
        const result = await getRemitoByIdAction(remito.id, session);
        if (result.success && result.data) {
            setSelectedDetail(result.data);
        } else {
            setError(result.error || "No se pudo obtener el detalle del remito.");
        }
    };

    const handleVerTrazabilidad = async (remito: Remito) => {
        setError(null);
        const result = await getTrazabilidadRemitoAction(remito.id, session);
        if (result.success && result.data) {
            setSelectedTrazabilidad({
                remito,
                historial: result.data.historial
            });
        } else {
            setError(result.error || "No se pudo consultar la trazabilidad del remito.");
        }
    };

    const handleDespacho = async (remito: Remito) => {
        setError(null);
        setSuccessMessage(null);
        const result = await registrarDespachoRemitoAction({
            session,
            id: remito.id,
            fechaDespacho: new Date().toISOString().slice(0, 10)
        });
        if (result.success) {
            setSuccessMessage(result.message || "Despacho registrado correctamente.");
            await loadRemitos();
        } else {
            setError(result.error || "No se pudo registrar el despacho.");
        }
    };

    const handleRecepcion = async (remito: Remito, conIncidencia: boolean) => {
        setError(null);
        setSuccessMessage(null);
        const result = await registrarRecepcionRemitoAction({
            session,
            id: remito.id,
            fechaRecepcion: new Date().toISOString().slice(0, 10),
            conIncidencia
        });
        if (result.success) {
            setSuccessMessage(result.message || "Recepción registrada correctamente.");
            await loadRemitos();
        } else {
            setError(result.error || "No se pudo registrar la recepción.");
        }
    };

    return (
        <section style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <h2 style={{ margin: 0 }}>Logística y Remitos ({total})</h2>
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
                        Emitir remito
                    </button>
                )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <input
                    type="text"
                    placeholder="ID Sede Origen..."
                    value={sedeOrigenFilter}
                    onChange={(e) => setSedeOrigenFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
                <input
                    type="text"
                    placeholder="ID Sede Destino..."
                    value={sedeDestinoFilter}
                    onChange={(e) => setSedeDestinoFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
                <select
                    aria-label="Filtrar por estado de envío"
                    value={estadoFilter}
                    onChange={(e) => setEstadoFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                >
                    <option value="">Todos los estados</option>
                    {EstadoEnvio.toOptions().map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => void loadRemitos()}
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
                            <th style={{ padding: "0.75rem" }}>Número</th>
                            <th style={{ padding: "0.75rem" }}>Emisión</th>
                            <th style={{ padding: "0.75rem" }}>Despacho</th>
                            <th style={{ padding: "0.75rem" }}>Recepción</th>
                            <th style={{ padding: "0.75rem" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {remitos.length === 0 && !isLoading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: "1rem", textAlign: "center", color: "#6b7280" }}>
                                    No se encontraron remitos.
                                </td>
                            </tr>
                        ) : (
                            remitos.map((remito) => (
                                <tr key={remito.id || remito.numero} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    <td style={{ padding: "0.75rem" }}>{remito.numero}</td>
                                    <td style={{ padding: "0.75rem" }}>{formatDate(remito.fechaEmision)}</td>
                                    <td style={{ padding: "0.75rem" }}>{formatDate(remito.fechaDespacho)}</td>
                                    <td style={{ padding: "0.75rem" }}>{formatDate(remito.fechaRecepcion)}</td>
                                    <td style={{ padding: "0.75rem", display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                                        <button
                                            type="button"
                                            onClick={() => void handleVerDetalle(remito)}
                                            style={{ padding: "0.35rem 0.65rem", borderRadius: "6px", border: "1px solid #2563eb", color: "#2563eb", backgroundColor: "transparent", cursor: "pointer" }}
                                        >
                                            Detalle
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void handleVerTrazabilidad(remito)}
                                            style={{ padding: "0.35rem 0.65rem", borderRadius: "6px", border: "1px solid #6b7280", color: "#374151", backgroundColor: "transparent", cursor: "pointer" }}
                                        >
                                            Trazabilidad
                                        </button>
                                        {!remito.fechaDespacho && (
                                            <button
                                                type="button"
                                                onClick={() => void handleDespacho(remito)}
                                                style={{ padding: "0.35rem 0.65rem", borderRadius: "6px", border: "1px solid #0284c7", color: "#0284c7", backgroundColor: "transparent", cursor: "pointer" }}
                                            >
                                                Despachar
                                            </button>
                                        )}
                                        {remito.fechaDespacho && !remito.fechaRecepcion && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => void handleRecepcion(remito, false)}
                                                    style={{ padding: "0.35rem 0.65rem", borderRadius: "6px", border: "1px solid #059669", color: "#059669", backgroundColor: "transparent", cursor: "pointer" }}
                                                >
                                                    Recibir OK
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => void handleRecepcion(remito, true)}
                                                    style={{ padding: "0.35rem 0.65rem", borderRadius: "6px", border: "1px solid #dc2626", color: "#dc2626", backgroundColor: "transparent", cursor: "pointer" }}
                                                >
                                                    Con incidencia
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

            {selectedDetail && (
                <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0 }}>Remito {selectedDetail.remito.numero} — Ejemplares incluidos</h3>
                        <button type="button" onClick={() => setSelectedDetail(null)} style={{ cursor: "pointer" }}>
                            Cerrar
                        </button>
                    </div>
                    {selectedDetail.ejemplares.length === 0 ? (
                        <p style={{ color: "#6b7280" }}>No hay ejemplares asociados.</p>
                    ) : (
                        <ul style={{ margin: "0.5rem 0 0 1.25rem" }}>
                            {selectedDetail.ejemplares.map((ej) => (
                                <li key={ej.id || ej.codigo}>
                                    {ej.codigo} — <span>{ej.estadoName}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {selectedTrazabilidad && (
                <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0 }}>Trazabilidad Remito {selectedTrazabilidad.remito.numero}</h3>
                        <button type="button" onClick={() => setSelectedTrazabilidad(null)} style={{ cursor: "pointer" }}>
                            Cerrar
                        </button>
                    </div>
                    {selectedTrazabilidad.historial.length === 0 ? (
                        <p style={{ color: "#6b7280" }}>Sin movimientos registrados.</p>
                    ) : (
                        <ul style={{ margin: "0.5rem 0 0 1.25rem" }}>
                            {selectedTrazabilidad.historial.map((h) => (
                                <li key={h.id || `${h.estado.value}-${h.fechaInicio}`}>
                                    <strong>{h.estadoName}</strong> — Inicio: {formatDate(h.fechaInicio)} | Fin: {formatDate(h.fechaFin)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </section>
    );
};
