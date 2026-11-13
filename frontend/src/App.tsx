import { AuthProvider } from "@/ui/context/auth-context";
import { useAuth } from "@/ui/hooks/use-auth";
import { LoginSection } from "@/ui/sections/login-section/login-section";
import { SedeSection } from "@/ui/sections/sede-section/sede-section";

function AppContent() {
    const { session, isAuthenticated } = useAuth();

    return (
        <main>
            <LoginSection />
            {isAuthenticated && session && <SedeSection key={session.accessToken} session={session} />}
        </main>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
