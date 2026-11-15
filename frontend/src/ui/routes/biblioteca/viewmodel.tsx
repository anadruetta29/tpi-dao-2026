import { useMemo, useState } from "react";
import { Rol } from "@/domain/entities/rol";
import { useAuth } from "@/ui/hooks/use-auth";
import { BandejaRoute } from "@/ui/routes/bandeja/bandeja-route";
import { AvisosRoute } from "@/ui/routes/avisos/avisos-route";
import { type DestinoBandeja } from "@/ui/routes/bandeja/viewmodel";
import { SedesRoute } from "@/ui/routes/sedes/sedes-route";
import { SociosRoute } from "@/ui/routes/socios/socios-route";
import { UsuariosRoute } from "@/ui/routes/usuarios/usuarios-route";
import { LibrosRoute } from "@/ui/routes/libros/libros-route";
import { AutoresRoute } from "@/ui/routes/autores/autores-route";
import { SolicitudesPrestamoRoute } from "@/ui/routes/solicitudes-prestamo/solicitudes-prestamo-route";
import { PrestamosRoute } from "@/ui/routes/prestamos/prestamos-route";
import { ReservasRoute } from "@/ui/routes/reservas/reservas-route";
import { RemitosRoute } from "@/ui/routes/remitos/remitos-route";
import { DevolucionesRoute } from "@/ui/routes/devoluciones/devoluciones-route";
import { MultasRoute } from "@/ui/routes/multas/multas-route";
import { type NavigationGroup } from "@/ui/components/library-navigation/library-navigation";

const modules = [
    { area: "Operación", label: "Bandeja", Component: BandejaRoute },
    { area: "Operación", label: "Avisos", Component: AvisosRoute },
    { area: "Administración", label: "Sedes", Component: SedesRoute },
    { area: "Administración", label: "Usuarios", Component: UsuariosRoute, adminOnly: true },
    { area: "Administración", label: "Socios", Component: SociosRoute },
    { area: "Catálogo", label: "Libros", Component: LibrosRoute },
    { area: "Catálogo", label: "Autores", Component: AutoresRoute },
    { area: "Circulación", label: "Solicitudes de préstamo", Component: SolicitudesPrestamoRoute },
    { area: "Circulación", label: "Préstamos", Component: PrestamosRoute },
    { area: "Circulación", label: "Reservas", Component: ReservasRoute },
    { area: "Circulación", label: "Devoluciones", Component: DevolucionesRoute },
    { area: "Circulación", label: "Multas", Component: MultasRoute },
    { area: "Logística", label: "Remitos", Component: RemitosRoute }
] as const;

type ModuleLabel = (typeof modules)[number]["label"];

export function useViewModel() {
    const { session, user, error, isLoading, logout, refreshCurrentUser } = useAuth();
    const [active, setActive] = useState<{ label: ModuleLabel; recordId?: string; prestamoId?: string }>({ label: "Bandeja" });

    {/* ===== onActions functions ===== */ }

    const onTabClick = (label: ModuleLabel) => {
        setActive({ label });
    };

    const openPending = ({ modulo, id }: DestinoBandeja) => {
        setActive({ label: modulo, recordId: id });
    };

    const openReturn = (prestamoId: string) => {
        setActive({ label: "Devoluciones", prestamoId });
    };

    const onLogout = async () => {
        logout();
    };

    const onRefresh = async () => {
        await refreshCurrentUser();
    };

    {/* ===== variables ===== */ }

    const availableModules = useMemo(() => {
        return modules.filter((module) => !("adminOnly" in module) || user?.roleEntity === Rol.ADMIN);
    }, [user?.roleEntity]);

    const selectedModule = useMemo(() => {
        return availableModules.find((module) => module.label === active.label) ?? availableModules[0];
    }, [availableModules, active.label]);

    const navigationGroups = useMemo(() => {
        const groups = new Map<string, NavigationGroup>();
        for (const { area, label } of availableModules) {
            let group = groups.get(area);
            if (!group) {
                group = { label: area, items: [] };
                groups.set(area, group);
            }
            group.items.push({
                label,
                selected: label === selectedModule.label,
                onClick: () => onTabClick(label)
            });
        }
        return [...groups.values()];
    }, [availableModules, selectedModule.label]);

    const userProfile = user ? {
        username: `${user.nombre} ${user.apellido}`.trim() || user.email,
        initials: `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase() || "U",
        email: user.email,
        role: user.roleName,
        activity: user.activo ? "Activo" : "Inactivo",
        error,
        isLoading,
        onLogout,
        onRefresh
    } : null;

    return {
        session: user ? session : null,
        Component: selectedModule.Component,
        label: selectedModule.label,
        openPending,
        openReturn,
        initialRecordId: active.recordId,
        prestamoInicialId: active.prestamoId,
        area: selectedModule.area,
        navigation: navigationGroups,
        profile: userProfile
    };
}

export default useViewModel;
export { useViewModel as ViewModel };
