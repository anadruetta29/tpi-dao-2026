import { useAuthContext, type AuthContextValue } from "@/ui/context/auth-context";

export function useAuth(): AuthContextValue {
    return useAuthContext();
}
