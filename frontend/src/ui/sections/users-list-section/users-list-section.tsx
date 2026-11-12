import React, { useCallback, useEffect, useState } from "react";
import { Usuario, Rol } from "@/domain/entities/usuario";
import { useAuth } from "@/ui/hooks/use-auth";
import { getAllUsuariosAction } from "@/ui/actions/usuario/usuario.actions";

export interface UsersListSectionProps {
    onSelectUsuario?: (usuario: Usuario) => void;
    onCreateClick?: () => void;
}

export const UsersListSection: React.FC<UsersListSectionProps> = ({
    onSelectUsuario,
    onCreateClick
}) => {
    const { session } = useAuth();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [roleFilter, setRoleFilter] = useState<string>("");
    const [activoFilter, setActivoFilter] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadUsuarios = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const activoValue =
            activoFilter === "true" ? true : activoFilter === "false" ? false : null;

        const result = await getAllUsuariosAction({
            session,
            role: roleFilter || null,
            activo: activoValue
        });

        if (result.success && result.data) {
            setUsuarios(result.data.usuarios);
            setTotal(result.data.total);
        } else {
            setError(result.error || "No se pudieron cargar los usuarios.");
        }

        setIsLoading(false);
    }, [session, roleFilter, activoFilter]);

    useEffect(() => {
        void loadUsuarios();
    }, [loadUsuarios]);

    return (
        <section style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <h2 style={{ margin: 0 }}>Usuarios ({total})</h2>
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
                        Nuevo usuario
                    </button>
                )}
            </div>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <select
                    aria-label="Filtrar por rol"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                >
                    <option value="">Todos los roles</option>
                    {Rol.toOptions().map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Filtrar por estado"
                    value={activoFilter}
                    onChange={(e) => setActivoFilter(e.target.value)}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                >
                    <option value="">Todos los estados</option>
                    <option value="true">Activos</option>
                    <option value="false">Inactivos</option>
                </select>

                <button
                    type="button"
                    onClick={() => void loadUsuarios()}
                    disabled={isLoading}
                    style={{ padding: "0.5rem 0.9rem", borderRadius: "6px", border: "1px solid #ccc", cursor: "pointer" }}
                >
                    {isLoading ? "Cargando..." : "Refrescar"}
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
                            <th style={{ padding: "0.75rem" }}>Nombre</th>
                            <th style={{ padding: "0.75rem" }}>Email</th>
                            <th style={{ padding: "0.75rem" }}>Rol</th>
                            <th style={{ padding: "0.75rem" }}>Estado</th>
                            {onSelectUsuario && <th style={{ padding: "0.75rem" }}>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.length === 0 && !isLoading ? (
                            <tr>
                                <td colSpan={onSelectUsuario ? 5 : 4} style={{ padding: "1rem", textAlign: "center", color: "#6b7280" }}>
                                    No se encontraron usuarios.
                                </td>
                            </tr>
                        ) : (
                            usuarios.map((usuario) => (
                                <tr key={usuario.id || usuario.email} style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    <td style={{ padding: "0.75rem" }}>{usuario.nombre} {usuario.apellido}</td>
                                    <td style={{ padding: "0.75rem" }}>{usuario.email}</td>
                                    <td style={{ padding: "0.75rem" }}>{usuario.roleName}</td>
                                    <td style={{ padding: "0.75rem" }}>{usuario.activo ? "Activo" : "Inactivo"}</td>
                                    {onSelectUsuario && (
                                        <td style={{ padding: "0.75rem" }}>
                                            <button
                                                type="button"
                                                onClick={() => onSelectUsuario(usuario)}
                                                style={{
                                                    padding: "0.35rem 0.75rem",
                                                    borderRadius: "6px",
                                                    border: "1px solid #2563eb",
                                                    backgroundColor: "transparent",
                                                    color: "#2563eb",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Editar
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
