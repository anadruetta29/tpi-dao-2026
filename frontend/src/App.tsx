import { useState } from "react";
import { AuthProvider } from "@/ui/context/auth-context";
import { useAuth } from "@/ui/hooks/use-auth";
import { LoginSection } from "@/ui/sections/login-section/login-section";
import { SedeSection } from "@/ui/sections/sede-section/sede-section";
import { SocioSection } from "@/ui/sections/socio-section/socio-section";
import { SolicitudPrestamoSection } from "@/ui/sections/solicitud-prestamo-section/solicitud-prestamo-section";
import { ReservaSection } from "@/ui/sections/reserva-section/reserva-section";
import { DevolucionSection } from "@/ui/sections/devolucion-section/devolucion-section";
import { libraryButtonStyle, libraryControlsStyle } from "@/ui/components/library-records/library-records.styles";
import { type Session } from "@/domain/entities/session";

const sections = [
    { label: "Sedes", Component: SedeSection },
    { label: "Socios", Component: SocioSection },
    { label: "Solicitudes de préstamo", Component: SolicitudPrestamoSection },
    { label: "Reservas", Component: ReservaSection },
    { label: "Devoluciones", Component: DevolucionSection }
] as const;

function LibrarySections({ session }: { session: Session }) {
    const [section, setSection] = useState(0);
    const { Component } = sections[section];

    return (
        <>
            <nav aria-label="Módulos de la biblioteca" style={{ ...libraryControlsStyle, justifyContent: "center", paddingInline: "1rem" }}>
                {sections.map(({ label }, index) => (
                    <button
                        key={label}
                        type="button"
                        style={section === index ? { ...libraryButtonStyle, backgroundColor: "#2563eb", color: "#fff" } : libraryButtonStyle}
                        aria-pressed={section === index}
                        onClick={() => setSection(index)}
                    >
                        {label}
                    </button>
                ))}
            </nav>
            <Component session={session} />
        </>
    );
}

function AppContent() {
    const { session, isAuthenticated } = useAuth();

    return (
        <main>
            <LoginSection />
            {isAuthenticated && session && <LibrarySections key={session.accessToken} session={session} />}
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
