import React, { useState } from "react";
import { useAuth } from "@/ui/hooks/use-auth";
import { createLibroAction } from "@/ui/actions/libro/libro.actions";

export interface CreateLibroSectionProps {
    onSuccess?: (id: string) => void;
    onCancel?: () => void;
}

export const CreateLibroSection: React.FC<CreateLibroSectionProps> = ({
    onSuccess,
    onCancel
}) => {
    const { session } = useAuth();
    const [titulo, setTitulo] = useState("");
    const [añoPublicacion, setAñoPublicacion] = useState<string>(String(new Date().getFullYear()));
    const [editorial, setEditorial] = useState("");
    const [edicion, setEdicion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        const result = await createLibroAction({
            session,
            titulo: titulo.trim(),
            añoPublicacion: Number(añoPublicacion),
            editorial: editorial.trim(),
            edicion: edicion.trim()
        });

        setIsLoading(false);

        if (result.success && result.data) {
            setSuccessMessage(result.message || "Libro registrado correctamente.");
            setTitulo("");
            setEditorial("");
            setEdicion("");
            if (onSuccess) {
                onSuccess(result.data.id);
            }
        } else {
            setError(result.error || "No se pudo registrar el libro.");
        }
    };

    return (
        <section style={{ padding: "1.5rem", maxWidth: "460px", width: "100%" }}>
            <h2 style={{ marginTop: 0 }}>Registrar Libro</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-libro-titulo" style={{ fontWeight: 600 }}>Título</label>
                    <input
                        id="create-libro-titulo"
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-libro-anio" style={{ fontWeight: 600 }}>Año de publicación</label>
                    <input
                        id="create-libro-anio"
                        type="number"
                        value={añoPublicacion}
                        onChange={(e) => setAñoPublicacion(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-libro-editorial" style={{ fontWeight: 600 }}>Editorial</label>
                    <input
                        id="create-libro-editorial"
                        type="text"
                        value={editorial}
                        onChange={(e) => setEditorial(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-libro-edicion" style={{ fontWeight: 600 }}>Edición</label>
                    <input
                        id="create-libro-edicion"
                        type="text"
                        value={edicion}
                        onChange={(e) => setEdicion(e.target.value)}
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
