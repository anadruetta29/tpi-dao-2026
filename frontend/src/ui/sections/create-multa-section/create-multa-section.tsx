import React, { useState } from "react";
import { MotivoMulta } from "@/domain/entities/motivo-multa";
import { useAuth } from "@/ui/hooks/use-auth";
import { createMultaAction } from "@/ui/actions/multa/multa.actions";

export interface CreateMultaSectionProps {
    defaultSocioId?: string;
    defaultPrestamoId?: string;
    onSuccess?: (id: string) => void;
    onCancel?: () => void;
}

export const CreateMultaSection: React.FC<CreateMultaSectionProps> = ({
    defaultSocioId = "",
    defaultPrestamoId = "",
    onSuccess,
    onCancel
}) => {
    const { session } = useAuth();
    const [socioId, setSocioId] = useState(defaultSocioId);
    const [prestamoId, setPrestamoId] = useState(defaultPrestamoId);
    const [motivo, setMotivo] = useState<string>(MotivoMulta.ENTREGA_TARDIA.value);
    const [monto, setMonto] = useState<string>("0");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        const result = await createMultaAction({
            session,
            socio_id: socioId.trim(),
            prestamo_id: prestamoId.trim(),
            motivo: MotivoMulta.fromString(motivo),
            monto: Number(monto)
        });

        setIsLoading(false);

        if (result.success && result.data) {
            setSuccessMessage(result.message || "Multa registrada correctamente.");
            setSocioId("");
            setPrestamoId("");
            setMonto("0");
            if (onSuccess) {
                onSuccess(result.data.id);
            }
        } else {
            setError(result.error || "No se pudo registrar la multa.");
        }
    };

    return (
        <section style={{ padding: "1.5rem", maxWidth: "460px", width: "100%" }}>
            <h2 style={{ marginTop: 0 }}>Registrar Multa</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-multa-socio" style={{ fontWeight: 600 }}>ID de Socio</label>
                    <input
                        id="create-multa-socio"
                        type="text"
                        value={socioId}
                        onChange={(e) => setSocioId(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-multa-prestamo" style={{ fontWeight: 600 }}>ID de Préstamo</label>
                    <input
                        id="create-multa-prestamo"
                        type="text"
                        value={prestamoId}
                        onChange={(e) => setPrestamoId(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-multa-motivo" style={{ fontWeight: 600 }}>Motivo</label>
                    <select
                        id="create-multa-motivo"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    >
                        {MotivoMulta.toOptions().map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-multa-monto" style={{ fontWeight: 600 }}>Monto</label>
                    <input
                        id="create-multa-monto"
                        type="number"
                        step="0.01"
                        min="0"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
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
                        {isLoading ? "Registrando..." : "Registrar multa"}
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
