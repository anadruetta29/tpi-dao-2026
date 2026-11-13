import React, { useCallback, useEffect, useState } from "react";
import { Libro } from "@/domain/entities/libro";
import { type LibroDisponibilidadSedeItem } from "@/domain/dto/libro/response/GetLibroDisponibilidadRes";
import { useAuth } from "@/ui/hooks/use-auth";
import {
    deleteLibroAction,
    getAllLibrosAction,
    getLibroDisponibilidadAction
} from "@/ui/actions/libro/libro.actions";

export interface LibrosListSectionProps {
    onSelectLibro?: (libro: Libro) => void;
    onCreateClick?: () => void;
}

export const LibrosListSection: React.FC<LibrosListSectionProps> = ({
    onSelectLibro,
    onCreateClick
}) => {
    const { session } = useAuth();
    const [libros, setLibros] = useState<Libro[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [tituloFilter, setTituloFilter] = useState<string>("");
    const [autorFilter, setAutorFilter] = useState<string>("");
    const [editorialFilter, setEditorialFilter] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [disponibilidad, setDisponibilidad] = useState<{
        libro: Libro;
        sedes: LibroDisponibilidadSedeItem[];
    } | null>(null);

    const loadLibros = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const result = await getAllLibrosAction({
            session,
            titulo: tituloFilter.trim() || null,
            autor: autorFilter.trim() || null,
            editorial: editorialFilter.trim() || null
        });

        if (result.success && result.data) {
            setLibros(result.data.libros);
            setTotal(result.data.total);
        } else {
            setError(result.error || "No se pudieron cargar los libros.");
        }

        setIsLoading(false);
    }, [session, tituloFilter, autorFilter, editorialFilter]);

    useEffect(() => {
        void loadLibros();
    }, [loadLibros]);

    const handleVerDisponibilidad = async (libro: Libro) => {
        const result = await getLibroDisponibilidadAction(libro.id, session);
        if (result.success && result.data) {
            setDisponibilidad({ libro, sedes: result.data.sedes });
        } else {
            setError(result.error || "No se pudo consultar la disponibilidad.");
        }
    };

    const handleDelete = async (libro: Libro) => {
        const result = await deleteLibroAction(libro.id, session);
        if (result.success) {
            if (disponibilidad?.libro.id === libro.id) {
                setDisponibilidad(null);
            }
            await loadLibros();
        } else {
            setError(result.error || "No se pudo eliminar el libro.");
        }
    };

    return (
        <section style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <h2 style={{ margin: 0 }}>Catálogo de Libros ({total})</h2>
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
                        Registrar libro
                    </button>
                )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <input
                    type="text"
                    placeholder="Buscar por título..."
                    value={tituloFilter}
                    onChange={(e) => setTituloFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
                <input
                    type="text"
                    placeholder="Filtrar por autor..."
                    value={autorFilter}
                    onChange={(e) => setAutorFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
                <input
                    type="text"
                    placeholder="Filtrar por editorial..."
                    value={editorialFilter}
                    onChange={(e) => setEditorialFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                />
                <button
                    type="button"
                    onClick={() => void loadLibros()}
                    disabled={isLoading}
                    style={{ padding: "0.5rem 0.9rem", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer" }}
                >
                    {isLoading ? "Cargando..." : "Buscar"}
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
                            <th style={{ padding: "0.75rem" }}>Título</th>
                            <th style={{ padding: "0.75rem" }}>Año</th>
                            <th style={{ padding: "0.75rem" }}>Editorial</th>
                            <th style={{ padding: "0.75rem" }}>Edición</th>
                            <th style={{ padding: "0.75rem" }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {libros.length === 0 && !isLoading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: "1rem", textAlign: "center", color: "#6b7280" }}>
                                    No se encontraron libros.
                                </td>
                            </tr>
                        ) : (
                            libros.map((libro) => (
                                <tr key={libro.id || libro.titulo} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    <td style={{ padding: "0.75rem" }}>{libro.titulo}</td>
                                    <td style={{ padding: "0.75rem" }}>{libro.añoPublicacion}</td>
                                    <td style={{ padding: "0.75rem" }}>{libro.editorial}</td>
                                    <td style={{ padding: "0.75rem" }}>{libro.edicion}</td>
                                    <td style={{ padding: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                        <button
                                            type="button"
                                            onClick={() => void handleVerDisponibilidad(libro)}
                                            style={{ padding: "0.35rem 0.7rem", borderRadius: "6px", border: "1px solid #059669", color: "#059669", backgroundColor: "transparent", cursor: "pointer" }}
                                        >
                                            Disponibilidad
                                        </button>
                                        {onSelectLibro && (
                                            <button
                                                type="button"
                                                onClick={() => onSelectLibro(libro)}
                                                style={{ padding: "0.35rem 0.7rem", borderRadius: "6px", border: "1px solid #2563eb", color: "#2563eb", backgroundColor: "transparent", cursor: "pointer" }}
                                            >
                                                Editar
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => void handleDelete(libro)}
                                            style={{ padding: "0.35rem 0.7rem", borderRadius: "6px", border: "1px solid #dc2626", color: "#dc2626", backgroundColor: "transparent", cursor: "pointer" }}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {disponibilidad && (
                <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0 }}>Disponibilidad: {disponibilidad.libro.titulo}</h3>
                        <button type="button" onClick={() => setDisponibilidad(null)} style={{ cursor: "pointer" }}>
                            Cerrar
                        </button>
                    </div>
                    {disponibilidad.sedes.length === 0 ? (
                        <p style={{ color: "#6b7280" }}>No hay ejemplares registrados para este libro.</p>
                    ) : (
                        disponibilidad.sedes.map((sedeItem) => (
                            <div key={sedeItem.sedeId || sedeItem.sedeNombre} style={{ marginTop: "0.75rem" }}>
                                <strong>{sedeItem.sedeNombre || `Sede #${sedeItem.sedeId}`}</strong>
                                <ul style={{ margin: "0.25rem 0 0 1.25rem" }}>
                                    {sedeItem.ejemplares.map((ej) => (
                                        <li key={ej.id || ej.codigo}>
                                            {ej.codigo} — <span>{ej.estadoName}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            )}
        </section>
    );
};
