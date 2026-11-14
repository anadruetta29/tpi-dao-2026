import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/core/provider/auth-context";

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
    return context;
}
