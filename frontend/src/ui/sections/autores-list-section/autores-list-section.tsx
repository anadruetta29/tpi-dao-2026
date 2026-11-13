import React, { useCallback, useEffect, useState } from "react";
import { Autor } from "@/domain/entities/autor";
import { useAuth } from "@/ui/hooks/use-auth";
import { createAutorAction, getAllAutoresAction } from "@/ui/actions/autor/autor.actions";

export const AutoresListSection: React.FC = () => {
    const { session } = useAuth();
    const [autores, setAutores] = useState<Autor[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const loadAutores = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const result = await getAllAutoresAction(session);
        if (result.success && result.data) {
            setAutores(result.data.autores);
            setTotal(result.data.total);
        } else {
            setError(result.error || "No se pudieron cargar los autores.");
        }

        setIsLoading(false);
    }, [session]);

    useEffect(() => {
        void loadAutores();
    }, [loadAutores]);

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsCreating(true);

        const result = await createAutorAction({
            session,
            nombre: nombre.trim(),
            apellido: apellido.trim()
        });

        setIsCreating(false);

        if (result.success) {
            setSuccessMessage(result.message || "Autor registrado correctamente.");
            setNombre("");
            setApellido("");
            await loadAutores();
        } else {
            setError(result.error || "No se pudo registrar el autor.");
        }
    };

    return (
        <section style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
            <h2 style={{ margin: 0 }}>Autores ({total})</h2>

            <form onSubmit={handleCreate} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", textAlign: "left" }}>
                    <label htmlFor="autor-nombre" style={{ fontWeight: 600, fontSize: "0.9rem" }}>Nombre</label>
                    <input
                        id="autor-nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        disabled={isCreating}
                        style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", textAlign: "left" }}>
                    <label htmlFor="autor-apellido" style={{ fontWeight: 600, fontSize: "0.9rem" }}>Apellido</label>
                    <input
                        id="autor-apellido"
                        type="text"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                        disabled={isCreating}
                        style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isCreating}
                    style={{
                        padding: "0.55rem 1rem",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        fontWeight: 600,
                        cursor: isCreating ? "not-allowed" : "pointer"
                    }}
                >
                    {isCreating ? "Guardando..." : "Registrar autor"}
                </button>
            </form>

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
                            <th style={{ padding: "0.75rem" }}>Nombre</th>
                            <th style={{ padding: "0.75rem" }}>Apellido</th>
                        </tr>
                    </thead>
                    <tbody>
                        {autores.length === 0 && !isLoading ? (
                            <tr>
                                <td colSpan={2} style={{ padding: "1rem", textAlign: "center", color: "#6b7280" }}>
                                    No se encontraron autores.
                                </td>
                            </tr>
                        ) : (
                            autores.map((autor) => (
                                <tr key={autor.id || `${autor.nombre}-${autor.apellido}`} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    <td style={{ padding: "0.75rem" }}>{autor.nombre}</td>
                                    <td style={{ padding: "0.75rem" }}>{autor.apellido}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
