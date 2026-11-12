import React from "react";
import { useAuth } from "@/ui/hooks/use-auth";
import { LoginForm } from "@/ui/components/login-form/login-form";
import { LogoutButton } from "@/ui/components/logout-button/logout-button";

export const LoginSection: React.FC = () => {
    const { user, isAuthenticated, isLoading, refreshCurrentUser } = useAuth();

    return (
        <section style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
            {isAuthenticated && user ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem", borderRadius: "10px", border: "1px solid #e5e7eb", maxWidth: "420px", width: "100%" }}>
                    <h2 style={{ margin: 0 }}>Perfil de Usuario</h2>
                    <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <div><strong>Nombre:</strong> {user.nombre} {user.apellido}</div>
                        <div><strong>Email:</strong> {user.email}</div>
                        <div><strong>Rol:</strong> {user.roleName} ({user.role.value})</div>
                        <div><strong>Estado:</strong> {user.activo ? "Activo" : "Inactivo"}</div>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                        <button
                            type="button"
                            onClick={() => void refreshCurrentUser()}
                            disabled={isLoading}
                            style={{
                                padding: "0.55rem 0.9rem",
                                borderRadius: "6px",
                                border: "1px solid #2563eb",
                                backgroundColor: "transparent",
                                color: "#2563eb",
                                fontWeight: 600,
                                cursor: "pointer"
                            }}
                        >
                            Actualizar perfil (/auth/me)
                        </button>
                        <LogoutButton />
                    </div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", width: "100%", maxWidth: "400px" }}>
                    <h2 style={{ margin: 0 }}>Iniciar Sesión</h2>
                    <LoginForm />
                </div>
            )}
        </section>
    );
};
