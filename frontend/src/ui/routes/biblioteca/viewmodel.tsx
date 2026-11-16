import { modules, type ModuleLabel } from "@/core/utils/modules";
import { useAuth } from "@/ui/hooks/use-auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAllAvisosAction } from "@/ui/actions/aviso/aviso.actions";
import { getSedeByIdAction } from "@/ui/actions/sede/sede.actions";
import type { DestinoBandeja, SolicitudInterbibliotecariaInicial } from "@/core/types";
import { Rol } from "@/domain/entities/rol";
import type { NavigationGroup } from "@/ui/components/library-navigation/library-navigation";
import { moduleIcon } from "@/ui/components/library-records/viewmodel";

export default function ViewModel() {
    const { session, user, error, isLoading, logout, refreshCurrentUser } = useAuth();
    const [active, setActive] = useState<{
        label: ModuleLabel;
        recordId?: string;
        prestamoId?: string;
        solicitudInicial?: SolicitudInterbibliotecariaInicial;
    }>({ label: "Bandeja" });
    const [unreadAvisos, setUnreadAvisos] = useState(0);
    const [branch, setBranch] = useState<{ id: string; name: string } | null>(null);
    const branchId = user?.roleEntity === Rol.RECEPCIONISTA ? user.sedeId : undefined;
    const navigationRef = useRef<HTMLElement>(null);
    const profileRef = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        if (!session || !branchId) return;
        let active = true;
        void getSedeByIdAction({ session, id: branchId }).then((result) => {
            if (active && result.success && result.data?.nombre) setBranch({ id: branchId, name: result.data.nombre });
        });
        return () => { active = false; };
    }, [session, branchId]);

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

    useEffect(() => {
        const navigation = navigationRef.current;
        const activeButton = navigation?.querySelector('button[aria-pressed="true"]');
        if (!navigation || !activeButton || !window.matchMedia("(max-width: 860px)").matches) return;
        const bounds = navigation.getBoundingClientRect();
        const item = activeButton.getBoundingClientRect();
        if (item.left >= bounds.left && item.right <= bounds.right) return;
        navigation.scrollBy({
            left: (item.left + item.right - bounds.left - bounds.right) / 2,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
        });
    }, [selectedModule.label]);

    useEffect(() => {
        const closeOutside = (event: PointerEvent) => {
            const profile = profileRef.current;
            if (profile?.open && !profile.contains(event.target as Node)) profile.open = false;
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            const profile = profileRef.current;
            if (!profile?.open || event.key !== "Escape" || event.defaultPrevented) return;
            if (profile.contains(document.activeElement)) profile.querySelector("summary")?.focus();
            profile.open = false;
        };
        document.addEventListener("pointerdown", closeOutside);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOutside);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, []);

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
                icon: moduleIcon(label),
                count: label === "Avisos" && unreadAvisos > 0 ? unreadAvisos : undefined,
                accessibleLabel: label === "Avisos" && unreadAvisos > 0 ? `Avisos, ${unreadAvisos} sin leer` : undefined,
                selected: label === selectedModule.label,
                onClick: () => onTabClick(label)
            });
        }
        return [...groups.values()];
    }, [availableModules, selectedModule.label, unreadAvisos]);

    const branchName = branchId ? (branch?.id === branchId ? branch.name : `Sede #${branchId}`) : undefined;
    const userProfile = user ? {
        detailsRef: profileRef,
        username: `${user.nombre} ${user.apellido}`.trim() || user.email,
        initials: `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase() || "U",
        email: user.email,
        role: user.roleName,
        summary: branchName ? `${user.roleName} · ${branchName}` : user.roleName,
        branch: branchName,
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
        branch: branchName,
        navigation: navigationGroups,
        navigationRef,
        profile: userProfile
    };
}

