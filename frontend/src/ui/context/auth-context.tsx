import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Session } from "@/domain/entities/session";
import { Usuario } from "@/domain/entities/usuario";
import { type LoginCommand } from "@/domain/use-cases/auth/login";
import {
    getCurrentUserAction,
    getStoredSessionAction,
    loginAction,
    logoutAction
} from "@/ui/actions/auth/auth.actions";

export interface AuthContextValue {
    session: Session | null;
    user: Usuario | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (command: LoginCommand) => Promise<boolean>;
    logout: () => void;
    refreshCurrentUser: () => Promise<Usuario | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(() => getStoredSessionAction());
    const [user, setUser] = useState<Usuario | null>(() => getStoredSessionAction()?.user ?? null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const refreshCurrentUser = useCallback(async (): Promise<Usuario | null> => {
        const stored = getStoredSessionAction();
        if (!stored?.accessToken) {
            setSession(null);
            setUser(null);
            setIsLoading(false);
            return null;
        }

        setIsLoading(true);
        const result = await getCurrentUserAction(stored);
        if (result.success && result.data) {
            setSession(result.data.session);
            setUser(result.data.user);
            setError(null);
            setIsLoading(false);
            return result.data.user;
        } else {
            // Keep stored user if offline, or clear if unauthorized
            setIsLoading(false);
            return stored.user ?? null;
        }
    }, []);

    useEffect(() => {
        void refreshCurrentUser();
    }, [refreshCurrentUser]);

    const login = useCallback(async (command: LoginCommand): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        const result = await loginAction(command);
        if (result.success && result.data) {
            setSession(result.data.session);
            setUser(result.data.user);
            setIsLoading(false);
            return true;
        }

        setError(result.error || "Error al iniciar sesión.");
        setIsLoading(false);
        return false;
    }, []);

    const logout = useCallback(() => {
        logoutAction();
        setSession(null);
        setUser(null);
        setError(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                isAuthenticated: Boolean(session?.accessToken && user),
                isLoading,
                error,
                login,
                logout,
                refreshCurrentUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuthContext(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext debe utilizarse dentro de un AuthProvider");
    }
    return context;
}
