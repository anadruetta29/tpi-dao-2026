import React, { useState } from "react";
import { ModalidadPrestamoLocal } from "@/domain/entities/modalidad-prestamo-local";
import { useAuth } from "@/ui/hooks/use-auth";
import { createPrestamoAction } from "@/ui/actions/prestamo/prestamo.actions";

export interface CreatePrestamoSectionProps {
    defaultSolicitudId?: string;
    onSuccess?: (id: string) => void;
    onCancel?: () => void;
}

export const CreatePrestamoSection: React.FC<CreatePrestamoSectionProps> = ({
    defaultSolicitudId = "",
    onSuccess,
    onCancel
}) => {
    const { session } = useAuth();
    const [solicitudId, setSolicitudId] = useState(defaultSolicitudId);
    const [modalidad, setModalidad] = useState<string>(ModalidadPrestamoLocal.DOMICILIO.value);
    const [fechaInicio, setFechaInicio] = useState<string>(new Date().toISOString().slice(0, 10));
    const [fechaVencimiento, setFechaVencimiento] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        const result = await createPrestamoAction({
            session,
            solicitud_id: solicitudId.trim(),
            modalidad: ModalidadPrestamoLocal.fromString(modalidad),
            fechaInicio: fechaInicio || null,
            fechaVencimiento: fechaVencimiento || null
        });

        setIsLoading(false);

        if (result.success && result.data) {
            setSuccessMessage(result.message || "Préstamo efectivizado correctamente.");
            setSolicitudId("");
            if (onSuccess) {
                onSuccess(result.data.id);
            }
        } else {
            setError(result.error || "No se pudo efectivizar el préstamo.");
        }
    };

    return (
        <section style={{ padding: "1.5rem", maxWidth: "460px", width: "100%" }}>
            <h2 style={{ marginTop: 0 }}>Efectivizar Préstamo</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-prestamo-solicitud" style={{ fontWeight: 600 }}>ID de Solicitud Aprobada</label>
                    <input
                        id="create-prestamo-solicitud"
                        type="text"
                        value={solicitudId}
                        onChange={(e) => setSolicitudId(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-prestamo-modalidad" style={{ fontWeight: 600 }}>Modalidad</label>
                    <select
                        id="create-prestamo-modalidad"
                        value={modalidad}
                        onChange={(e) => setModalidad(e.target.value)}
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    >
                        {ModalidadPrestamoLocal.toOptions().map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-prestamo-inicio" style={{ fontWeight: 600 }}>Fecha de inicio</label>
                    <input
                        id="create-prestamo-inicio"
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-prestamo-vencimiento" style={{ fontWeight: 600 }}>Fecha de vencimiento</label>
                    <input
                        id="create-prestamo-vencimiento"
                        type="date"
                        value={fechaVencimiento}
                        onChange={(e) => setFechaVencimiento(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                {error && (
                    <div role="alert" style={{ padding: "0.65rem", borderRadius: "6px", backgroundColor: "#fee2e2", color: "#991b1b" }}>
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div role="status" style={{ padding: "0.65rem", borderRadius: "6px", backgroundColor: "#dcfce7", color: "#166534" }}>
                        {successMessage}
                    </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: "0.6rem 1rem",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            fontWeight: 600,
                            cursor: isLoading ? "not-allowed" : "pointer"
                        }}
                    >
                        {isLoading ? "Registrando..." : "Efectivizar préstamo"}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            style={{ padding: "0.6rem 1rem", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer" }}
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
};
