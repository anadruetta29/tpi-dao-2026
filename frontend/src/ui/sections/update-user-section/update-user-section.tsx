import React, { useEffect, useState } from "react";
import { Rol } from "@/domain/entities/rol";
import { useAuth } from "@/ui/hooks/use-auth";
import { getUsuarioByIdAction, updateUsuarioAction } from "@/ui/actions/usuario/usuario.actions";

export interface UpdateUserSectionProps {
    userId: string;
    onSuccess?: (id: string) => void;
    onCancel?: () => void;
}

export const UpdateUserSection: React.FC<UpdateUserSectionProps> = ({
    userId,
    onSuccess,
    onCancel
}) => {
    const { session } = useAuth();
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<string>(Rol.RECEPCIONISTA.value);
    const [activo, setActivo] = useState<boolean>(true);
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchUsuario = async () => {
            setIsFetching(true);
            setError(null);

            const result = await getUsuarioByIdAction(userId, session);
            if (!mounted) return;

            if (result.success && result.data) {
                const u = result.data.usuario;
                setNombre(u.nombre);
                setApellido(u.apellido);
                setEmail(u.email);
                setRole(u.role.value);
                setActivo(u.activo);
            } else {
                setError(result.error || "No se pudo cargar el usuario.");
            }

            setIsFetching(false);
        };

        if (userId) {
            void fetchUsuario();
        }

        return () => {
            mounted = false;
        };
    }, [userId, session]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsSaving(true);

        const result = await updateUsuarioAction({
            session,
            id: userId,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: email.trim(),
            role: Rol.fromString(role),
            activo
        });

        setIsSaving(false);

        if (result.success && result.data) {
            setSuccessMessage(result.message || "Usuario actualizado correctamente.");
            if (onSuccess) {
                onSuccess(result.data.id);
            }
        } else {
            setError(result.error || "No se pudo actualizar el usuario.");
        }
    };

    if (isFetching) {
        return <section style={{ padding: "1.5rem" }}>Cargando usuario...</section>;
    }

    return (
        <section style={{ padding: "1.5rem", maxWidth: "460px", width: "100%" }}>
            <h2 style={{ marginTop: 0 }}>Modificar Usuario</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="update-user-nombre" style={{ fontWeight: 600 }}>Nombre</label>
                    <input
                        id="update-user-nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        disabled={isSaving}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="update-user-apellido" style={{ fontWeight: 600 }}>Apellido</label>
                    <input
                        id="update-user-apellido"
                        type="text"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                        disabled={isSaving}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="update-user-email" style={{ fontWeight: 600 }}>Correo electrónico</label>
                    <input
                        id="update-user-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isSaving}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="update-user-role" style={{ fontWeight: 600 }}>Rol</label>
                    <select
                        id="update-user-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={isSaving}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    >
                        {Rol.toOptions().map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
                    <input
                        type="checkbox"
                        checked={activo}
                        onChange={(e) => setActivo(e.target.checked)}
                        disabled={isSaving}
                    />
                    Usuario activo
                </label>

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
