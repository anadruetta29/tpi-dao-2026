import React, { useState } from "react";
import { Rol } from "@/domain/entities/rol";
import { useAuth } from "@/ui/hooks/use-auth";
import { createUsuarioAction } from "@/ui/actions/usuario/usuario.actions";

export interface CreateUserSectionProps {
    onSuccess?: (id: string) => void;
    onCancel?: () => void;
}

export const CreateUserSection: React.FC<CreateUserSectionProps> = ({
    onSuccess,
    onCancel
}) => {
    const { session } = useAuth();
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<string>(Rol.RECEPCIONISTA.value);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        const result = await createUsuarioAction({
            session,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: email.trim(),
            password,
            role: Rol.fromString(role)
        });

        setIsLoading(false);

        if (result.success && result.data) {
            setSuccessMessage(result.message || "Usuario registrado correctamente.");
            setNombre("");
            setApellido("");
            setEmail("");
            setPassword("");
            setRole(Rol.RECEPCIONISTA.value);
            if (onSuccess) {
                onSuccess(result.data.id);
            }
        } else {
            setError(result.error || "No se pudo registrar el usuario.");
        }
    };

    return (
        <section style={{ padding: "1.5rem", maxWidth: "460px", width: "100%" }}>
            <h2 style={{ marginTop: 0 }}>Registrar Usuario</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-user-nombre" style={{ fontWeight: 600 }}>Nombre</label>
                    <input
                        id="create-user-nombre"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-user-apellido" style={{ fontWeight: 600 }}>Apellido</label>
                    <input
                        id="create-user-apellido"
                        type="text"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-user-email" style={{ fontWeight: 600 }}>Correo electrónico</label>
                    <input
                        id="create-user-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-user-password" style={{ fontWeight: 600 }}>Contraseña</label>
                    <input
                        id="create-user-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", textAlign: "left" }}>
                    <label htmlFor="create-user-role" style={{ fontWeight: 600 }}>Rol</label>
                    <select
                        id="create-user-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        disabled={isLoading}
                        style={{ padding: "0.55rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    >
                        {Rol.toOptions().map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
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
