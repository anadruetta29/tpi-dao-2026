import { useEffect, useState } from "react";
import { type Session } from "@/domain/entities/session";
import { getAllEjemplaresAction } from "@/ui/actions/ejemplar/ejemplar.actions";
import { getAllLibrosAction } from "@/ui/actions/libro/libro.actions";
import { getAllPrestamosAction } from "@/ui/actions/prestamo/prestamo.actions";
import { getAllSedesAction } from "@/ui/actions/sede/sede.actions";
import { getAllSociosAction } from "@/ui/actions/socio/socio.actions";
import { getAllSolicitudesPrestamoAction } from "@/ui/actions/solicitud-prestamo/solicitud-prestamo.actions";
import { pickData } from "@/ui/routes/use-library-records-viewmodel";

type Source = "sedes" | "socios" | "libros" | "ejemplares" | "prestamos" | "solicitudes";

async function loadCatalog(session: Session, sources: Set<Source>) {
    const [sedes, socios, libros, ejemplares, prestamos, solicitudes] = await Promise.all([
        sources.has("sedes") ? getAllSedesAction({ session }) : null,
        sources.has("socios") ? getAllSociosAction({ session }) : null,
        sources.has("libros") || sources.has("ejemplares") || sources.has("prestamos") || sources.has("solicitudes")
            ? getAllLibrosAction({ session }) : null,
        sources.has("ejemplares") || sources.has("prestamos") || sources.has("solicitudes")
            ? getAllEjemplaresAction({ session }) : null,
        sources.has("prestamos") ? getAllPrestamosAction({ session }) : null,
        sources.has("solicitudes") ? getAllSolicitudesPrestamoAction({ session }) : null
    ]);
    const titles = new Map(libros?.data?.libros.map(({ id, titulo }) => [id, titulo]));
    const members = new Map(socios?.data?.map(({ id, nombre, apellido }) => [id, `${nombre} ${apellido}`]));
    const branches = new Map(sedes?.data?.map(({ id, nombre }) => [id, nombre]));
    const copies = new Map(ejemplares?.data?.ejemplares.map(({ id, codigo, libroId }) => [id, [titles.get(libroId), codigo].filter(Boolean).join(" · ")]));

    return {
        sedes: sedes && pickData(sedes, (items) => items.map(({ id, nombre, estado }) => ({ value: id, label: nombre, estado }))),
        socios: socios && pickData(socios, (items) => items.map(({ id, documento, estado }) => ({
            value: id, label: [members.get(id), documento].filter(Boolean).join(" · "), estado
        }))),
        libros: libros && pickData(libros, ({ libros: items }) => items.map(({ id, titulo, editorial, añoPublicacion }) => ({
            value: id, label: [titulo, editorial, añoPublicacion].filter(Boolean).join(" · ")
        }))),
        ejemplares: ejemplares && pickData(ejemplares, ({ ejemplares: items }) => items.map(({ id, sedeId, libroId, estado }) => ({
            value: id, label: [copies.get(id), branches.get(sedeId)].filter(Boolean).join(" · "), sedeId, libroId, estado
        }))),
        prestamos: prestamos && pickData(prestamos, ({ prestamos: items }) => items.map(({ id, ejemplarId, socioId, solicitudId, fechaInicio, estado, estadoName }) => ({
            value: id,
            label: [copies.get(ejemplarId) || "Préstamo", members.get(socioId), fechaInicio, estadoName].filter(Boolean).join(" · "),
            socioId, solicitudId, estado
        }))),
        solicitudes: solicitudes && pickData(solicitudes, (items) => items.map(({ id, numero, socioId, ejemplarId, estado, tipo }) => ({
            value: id, label: [numero, copies.get(ejemplarId), members.get(socioId)].filter(Boolean).join(" · "), estado, tipo: tipo?.value ?? tipo
        })))
    };
}

export function useSelectorCatalog(session: Session, ...sources: Source[]) {
    const key = sources.join(",");
    const [revision, setRevision] = useState(0);
    const [loaded, setLoaded] = useState<{ session: Session; key: string; data: Awaited<ReturnType<typeof loadCatalog>> } | null>(null);

    useEffect(() => {
        let active = true;
        void loadCatalog(session, new Set(key.split(",") as Source[])).then((data) => {
            if (active) setLoaded({ session, key, data });
        });
        return () => { active = false; };
    }, [session, key, revision]);

    const data = loaded?.session === session && loaded.key === key ? loaded.data : null;
    return {
        ...data,
        refresh: () => setRevision((current) => current + 1)
    };
}
