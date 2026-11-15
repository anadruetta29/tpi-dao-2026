import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type AuthContextValue } from "@/core/provider/auth-context";
import { type LoginCommand } from "@/domain/use-cases/auth/login";
import { getCurrentUserAction, getStoredSessionAction, loginAction, logoutAction } from "@/ui/actions/auth/auth.actions";

export function useSessionViewModel(): AuthContextValue {
    const [stored] = useState(getStoredSessionAction);
    const [session, setSession] = useState<typeof stored>(null);
    const [isLoading, setIsLoading] = useState(Boolean(stored));
    const [error, setError] = useState<string | null>(null);

    const request = useRef(0);

    {/* ===== Fetch data ===== */ }

    const fetchProfile = useCallback(async (current: NonNullable<typeof session>) => {
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

    {/* ===== Main useEffects ===== */ }

    useEffect(() => {
        let active = true;
        if (stored) {
            void Promise.resolve().then(() => {
                if (active) return fetchProfile(stored);
            });
        }
        return () => {
            active = false;
            request.current += 1;
        };
    }, [stored, fetchProfile]);

    {/* ===== onActions functions ===== */ }

    const onLogout = () => {
        request.current += 1;
        logoutAction();
        setSession(null);
        setError(null);
        setIsLoading(false);
    };

    const onRefreshCurrentUser = async () => {
        if (!session) return;
        setError(null);
        setIsLoading(true);
        await fetchProfile(session);
    };

    {/* ===== handlers functions ===== */ }

    const handleLogin = async (command: LoginCommand) => {
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
    };

    {/* ===== variables ===== */ }

    const currentUser = useMemo(() => {
        return session?.user ?? null;
    }, [session]);

    return {
        session,
        user: currentUser,
        isLoading,
        error,
        login: handleLogin,
        logout: onLogout,
        refreshCurrentUser: onRefreshCurrentUser
    };
}

export default useSessionViewModel;
export { useSessionViewModel as SessionViewModel };
