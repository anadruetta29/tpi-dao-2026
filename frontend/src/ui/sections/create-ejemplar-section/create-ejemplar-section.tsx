import React, { useState } from "react";
import { useAuth } from "@/ui/hooks/use-auth";
import { createEjemplarAction } from "@/ui/actions/ejemplar/ejemplar.actions";

export interface CreateEjemplarSectionProps {
    defaultLibroId?: string;
    defaultSedeId?: string;
    onSuccess?: (id: string) => void;
    onCancel?: () => void;
}

export const CreateEjemplarSection: React.FC<CreateEjemplarSectionProps> = ({
    defaultLibroId = "",
    defaultSedeId = "",
    onSuccess,
    onCancel
}) => {
    const { session } = useAuth();
    const [codigo, setCodigo] = useState("");
    const [libroId, setLibroId] = useState(defaultLibroId);
    const [sedeId, setSedeId] = useState(defaultSedeId);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        const result = await createEjemplarAction({
            session,
            codigo: codigo.trim(),
            libro_id: libroId.trim(),
            sede_id: sedeId.trim()
        });

        setIsLoading(false);

        if (result.success && result.data) {
            setSuccessMessage(result.message || "Ejemplar registrado correctamente.");
            setCodigo("");
            if (onSuccess) {
                onSuccess(result.data.id);
            }
        } else {
            setError(result.error || "No se pudo registrar el ejemplar.");
        }
    };

    return (
        <section style={{ padding: "1.5rem", maxWidth: "460px", width: "100%" }}>
            <h2 style={{ marginTop: 0 }}>Registrar Ejemplar Físico</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-ejemplar-codigo" style={{ fontWeight: 600 }}>Código</label>
                    <input
                        id="create-ejemplar-codigo"
                        type="text"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-ejemplar-libro" style={{ fontWeight: 600 }}>ID de Libro</label>
                    <input
                        id="create-ejemplar-libro"
                        type="text"
                        value={libroId}
                        onChange={(e) => setLibroId(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-ejemplar-sede" style={{ fontWeight: 600 }}>ID de Sede</label>
                    <input
                        id="create-ejemplar-sede"
                        type="text"
                        value={sedeId}
                        onChange={(e) => setSedeId(e.target.value)}
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
                        {isLoading ? "Guardando..." : "Registrar"}
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
