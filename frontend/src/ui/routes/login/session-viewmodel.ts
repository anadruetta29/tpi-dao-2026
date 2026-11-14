import { useCallback, useEffect, useRef, useState } from "react";
import { type AuthContextValue } from "@/core/provider/auth-context";
import { type LoginCommand } from "@/domain/use-cases/auth/login";
import { getCurrentUserAction, getStoredSessionAction, loginAction, logoutAction } from "@/ui/actions/auth/auth.actions";

export function useSessionViewModel(): AuthContextValue {
    const [stored] = useState(getStoredSessionAction);
    const [session, setSession] = useState<typeof stored>(null);
    const [isLoading, setIsLoading] = useState(Boolean(stored));
    const [error, setError] = useState<string | null>(null);
    const request = useRef(0);

    const loadProfile = useCallback(async (current: NonNullable<typeof session>) => {
        const version = ++request.current;
        const result = await getCurrentUserAction(current);
        if (version !== request.current) return;
        if (result.success && result.data) {
            setSession(result.data.session);
        } else {
            if (result.data === null) {
                logoutAction();
                setSession(null);
            } else {
                setSession(current);
            }
            setError(result.error || "No se pudo obtener el perfil.");
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        let active = true;
        if (stored) {
            void Promise.resolve().then(() => { if (active) return loadProfile(stored); });
        }
        return () => { active = false; request.current += 1; };
    }, [stored, loadProfile]);

    async function login(command: LoginCommand) {
        setIsLoading(true);
        setError(null);
        const result = await loginAction(command);
        setIsLoading(false);
        if (result.success && result.data) {
            setSession(result.data.session);
            return true;
        }
        setError(result.error || "Error al iniciar sesión.");
        return false;
    }

    return {
        session, user: session?.user ?? null, isLoading, error, login,
        logout: () => {
            request.current += 1;
            logoutAction();
            setSession(null);
            setError(null);
            setIsLoading(false);
        },
        refreshCurrentUser: async () => {
            if (!session) return;
            setError(null);
            setIsLoading(true);
            await loadProfile(session);
        }
    };
}
