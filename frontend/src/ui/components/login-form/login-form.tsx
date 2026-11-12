import React, { useState } from "react";
import { useAuth } from "@/ui/hooks/use-auth";

export interface LoginFormProps {
    onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
    const { login, isLoading, error } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLocalError(null);

        if (!email.trim() || !password.trim()) {
            setLocalError("Completá tu correo electrónico y contraseña.");
            return;
        }

        const ok = await login({
            email: email.trim(),
            password
        });

        if (ok && onSuccess) {
            onSuccess();
        }
    };

    const displayError = localError || error;

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "380px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", textAlign: "left" }}>
                <label htmlFor="auth-email" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    Correo electrónico
                </label>
                <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@biblioteca.edu.ar"
                    disabled={isLoading}
                    required
                    style={{ padding: "0.65rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.95rem" }}
                />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", textAlign: "left" }}>
                <label htmlFor="auth-password" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    Contraseña
                </label>
                <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                    style={{ padding: "0.65rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.95rem" }}
                />
            </div>

            {displayError && (
                <div role="alert" style={{ padding: "0.65rem 0.75rem", borderRadius: "6px", backgroundColor: "#fee2e2", color: "#991b1b", fontSize: "0.875rem" }}>
                    {displayError}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                style={{
                    padding: "0.7rem 1rem",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.7 : 1
                }}
            >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
        </form>
    );
};
