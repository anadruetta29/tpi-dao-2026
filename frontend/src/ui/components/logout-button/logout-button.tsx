import React from "react";
import { useAuth } from "@/ui/hooks/use-auth";

export interface LogoutButtonProps {
    label?: string;
    onLogout?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
    label = "Cerrar sesión",
    onLogout
}) => {
    const { logout } = useAuth();

    const handleClick = () => {
        logout();
        if (onLogout) {
            onLogout();
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            style={{
                padding: "0.55rem 0.9rem",
                borderRadius: "6px",
                border: "1px solid #dc2626",
                backgroundColor: "transparent",
                color: "#dc2626",
                fontWeight: 600,
                cursor: "pointer"
            }}
        >
            {label}
        </button>
    );
};
