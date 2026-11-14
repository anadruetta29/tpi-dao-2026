import { type ReactNode } from "react";
import { AuthContext } from "./auth-context";
import { useSessionViewModel } from "@/ui/routes/login/session-viewmodel";

export function AuthProvider({ children }: { children: ReactNode }) {
    const session = useSessionViewModel();
    return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
}
