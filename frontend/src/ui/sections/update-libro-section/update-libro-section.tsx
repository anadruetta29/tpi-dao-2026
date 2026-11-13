import React, { useEffect, useState } from "react";
import { useAuth } from "@/ui/hooks/use-auth";
import { getLibroByIdAction, updateLibroAction } from "@/ui/actions/libro/libro.actions";

export interface UpdateLibroSectionProps {
    libroId: string;
    onSuccess?: (id: string) => void;
    onCancel?: () => void;
}

export const UpdateLibroSection: React.FC<UpdateLibroSectionProps> = ({
    libroId,
    onSuccess,
    onCancel
}) => {
    const { session } = useAuth();
    const [titulo, setTitulo] = useState("");
    const [añoPublicacion, setAñoPublicacion] = useState<string>("");
    const [editorial, setEditorial] = useState("");
    const [edicion, setEdicion] = useState("");
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchLibro = async () => {
            setIsFetching(true);
            setError(null);

            const result = await getLibroByIdAction(libroId, session);
            if (!mounted) return;

            if (result.success && result.data) {
                const l = result.data.libro;
                setTitulo(l.titulo);
                setAñoPublicacion(String(l.añoPublicacion || ""));
                setEditorial(l.editorial);
                setEdicion(l.edicion);
            } else {
                setError(result.error || "No se pudo cargar el libro.");
            }

            setIsFetching(false);
        };

        if (libroId) {
            void fetchLibro();
        }

        return () => {
            mounted = false;
        };
    }, [libroId, session]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsSaving(true);

        const result = await updateLibroAction({
            session,
            id: libroId,
            titulo: titulo.trim(),
            añoPublicacion: Number(añoPublicacion),
            editorial: editorial.trim(),
            edicion: edicion.trim()
        });

        setIsSaving(false);

        if (result.success && result.data) {
            setSuccessMessage(result.message || "Libro actualizado correctamente.");
            if (onSuccess) {
                onSuccess(result.data.id);
            }
        } else {
            setError(result.error || "No se pudo actualizar el libro.");
        }
    };

    if (isFetching) {
        return <section style={{ padding: "1.5rem" }}>Cargando libro...</section>;
    }

    return (
        <section style={{ padding: "1.5rem", maxWidth: "460px", width: "100%" }}>
            <h2 style={{ marginTop: 0 }}>Modificar Libro</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="update-libro-titulo" style={{ fontWeight: 600 }}>Título</label>
                    <input
                        id="update-libro-titulo"
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                        disabled={isSaving}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="update-libro-anio" style={{ fontWeight: 600 }}>Año de publicación</label>
                    <input
                        id="update-libro-anio"
                        type="number"
                        value={añoPublicacion}
                        onChange={(e) => setAñoPublicacion(e.target.value)}
                        required
                        disabled={isSaving}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="update-libro-editorial" style={{ fontWeight: 600 }}>Editorial</label>
                    <input
                        id="update-libro-editorial"
                        type="text"
                        value={editorial}
                        onChange={(e) => setEditorial(e.target.value)}
                        required
                        disabled={isSaving}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="update-libro-edicion" style={{ fontWeight: 600 }}>Edición</label>
                    <input
                        id="update-libro-edicion"
                        type="text"
                        value={edicion}
                        onChange={(e) => setEdicion(e.target.value)}
                        required
                        disabled={isSaving}
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
                        disabled={isSaving}
                        style={{
                            padding: "0.6rem 1rem",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            fontWeight: 600,
                            cursor: isSaving ? "not-allowed" : "pointer"
                        }}
                    >
                        {isSaving ? "Actualizando..." : "Guardar cambios"}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSaving}
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
