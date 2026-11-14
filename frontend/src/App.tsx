import { AuthProvider } from "@/core/provider/session-provider";
import { useAuth } from "@/ui/hooks/use-auth";
import { LoginRoute } from "@/ui/routes/login/login-route";
import { BibliotecaRoute } from "@/ui/routes/biblioteca/biblioteca-route";

function AppRoutes() {
    const { user } = useAuth();
    return user ? <BibliotecaRoute /> : <LoginRoute />;
}

export function App() {
    return <AuthProvider><AppRoutes /></AuthProvider>;
}
