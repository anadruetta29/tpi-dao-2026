import { modules, type ModuleLabel } from "@/core/utils/modules";
import { useAuth } from "@/ui/hooks/use-auth";
import { useEffect, useMemo, useState } from "react";
import { getAllAvisosAction } from "@/ui/actions/aviso/aviso.actions";
import type { DestinoBandeja, SolicitudInterbibliotecariaInicial } from "@/core/types";
import { Rol } from "@/domain/entities/rol";
import type { NavigationGroup } from "@/ui/components/library-navigation/library-navigation";

export default function ViewModel() {
    const { session, user, error, isLoading, logout, refreshCurrentUser } = useAuth();
    const [active, setActive] = useState<{
        label: ModuleLabel;
        recordId?: string;
        prestamoId?: string;
        solicitudInicial?: SolicitudInterbibliotecariaInicial;
    }>({ label: "Bandeja" });
    const [unreadAvisos, setUnreadAvisos] = useState(0);

    useEffect(() => {
        if (!user || !session) return;
        let activeReq = true;
        void getAllAvisosAction({ session }).then((res) => {
            if (activeReq && res.success && res.data) {
                setUnreadAvisos(res.data.filter((a) => !a.leido).length);
            }
        });
        return () => { activeReq = false; };
    }, [user, session, active.label]);

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

    const openInterbibliotecaria = (solicitudInicial: SolicitudInterbibliotecariaInicial) => {
        setActive({ label: "Solicitudes de préstamo", solicitudInicial });
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
                label: label === "Avisos" && unreadAvisos > 0 ? `Avisos (${unreadAvisos})` : label,
                selected: label === selectedModule.label,
                onClick: () => onTabClick(label)
            });
        }
        return [...groups.values()];
    }, [availableModules, selectedModule.label, unreadAvisos]);

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
        openInterbibliotecaria,
        initialRecordId: active.recordId,
        prestamoInicialId: active.prestamoId,
        solicitudInicial: active.solicitudInicial,
        area: selectedModule.area,
        navigation: navigationGroups,
        profile: userProfile
    };
}

