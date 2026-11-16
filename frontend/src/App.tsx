import { AuthProvider } from "@/core/provider/session-provider";
import { useAuth } from "@/ui/hooks/use-auth";
import { LoginRoute } from "@/ui/routes/login/login-route";
import { BibliotecaRoute } from "@/ui/routes/biblioteca/biblioteca-route";
import { SessionLoading } from "@/ui/components/login/login";
import { useThemeViewModel } from "@/ui/layout/viewmodel";

function AppRoutes() {
    const { user, isRestoring } = useAuth();
    const theme = useThemeViewModel();
    if (isRestoring) return <SessionLoading />;
    return user ? <BibliotecaRoute theme={theme} /> : <LoginRoute theme={theme} />;
}

export function App() {
    return <AuthProvider><AppRoutes /></AuthProvider>;
}
