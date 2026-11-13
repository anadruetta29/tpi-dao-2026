import React, { useState } from "react";
import { useAuth } from "@/ui/hooks/use-auth";
import { createRemitoAction } from "@/ui/actions/remito/remito.actions";

export interface CreateRemitoSectionProps {
    onSuccess?: (id: string) => void;
    onCancel?: () => void;
}

export const CreateRemitoSection: React.FC<CreateRemitoSectionProps> = ({
    onSuccess,
    onCancel
}) => {
    const { session } = useAuth();
    const [solicitudId, setSolicitudId] = useState("");
    const [sedeOrigenId, setSedeOrigenId] = useState("");
    const [sedeDestinoId, setSedeDestinoId] = useState("");
    const [ejemplaresInput, setEjemplaresInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const ejemplaresIds = ejemplaresInput
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        if (ejemplaresIds.length === 0) {
            setError("Ingresá al menos un ID de ejemplar separado por coma.");
            return;
        }

        setIsLoading(true);

        const result = await createRemitoAction({
            session,
            ejemplaresIds,
            solicitud_id: solicitudId.trim() || null,
            sede_origen_id: sedeOrigenId.trim() || null,
            sede_destino_id: sedeDestinoId.trim() || null,
            fechaEmision: new Date().toISOString().slice(0, 10)
        });

        setIsLoading(false);

        if (result.success && result.data) {
            setSuccessMessage(result.message || "Remito emitido correctamente.");
            setEjemplaresInput("");
            if (onSuccess) {
                onSuccess(result.data.id);
            }
        } else {
            setError(result.error || "No se pudo emitir el remito.");
        }
    };

    return (
        <section style={{ padding: "1.5rem", maxWidth: "460px", width: "100%" }}>
            <h2 style={{ marginTop: 0 }}>Registrar Empaquetado y Emitir Remito</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-remito-solicitud" style={{ fontWeight: 600 }}>ID de Solicitud (opcional)</label>
                    <input
                        id="create-remito-solicitud"
                        type="text"
                        value={solicitudId}
                        onChange={(e) => setSolicitudId(e.target.value)}
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-remito-origen" style={{ fontWeight: 600 }}>ID Sede Origen</label>
                    <input
                        id="create-remito-origen"
                        type="text"
                        value={sedeOrigenId}
                        onChange={(e) => setSedeOrigenId(e.target.value)}
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-remito-destino" style={{ fontWeight: 600 }}>ID Sede Destino</label>
                    <input
                        id="create-remito-destino"
                        type="text"
                        value={sedeDestinoId}
                        onChange={(e) => setSedeDestinoId(e.target.value)}
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-remito-ejemplares" style={{ fontWeight: 600 }}>IDs de Ejemplares (separados por coma)</label>
                    <input
                        id="create-remito-ejemplares"
                        type="text"
                        placeholder="ej: 1, 2, 3"
                        value={ejemplaresInput}
                        onChange={(e) => setEjemplaresInput(e.target.value)}
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
                        {isLoading ? "Emitiendo..." : "Emitir remito"}
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
