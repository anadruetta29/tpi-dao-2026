import { useEffect, useState } from "react";
import { type ActionState } from "@/core/types";
import { EstadoEjemplar } from "@/domain/entities/ejemplar";
import { EstadoSede } from "@/domain/entities/sede";
import { EstadoSocio } from "@/domain/entities/socio";
import { Rol } from "@/domain/entities/rol";
import { type Session } from "@/domain/entities/session";
import { getAllEjemplaresAction } from "@/ui/actions/ejemplar/ejemplar.actions";
import { getAllLibrosAction } from "@/ui/actions/libro/libro.actions";
import { getAllSedesAction } from "@/ui/actions/sede/sede.actions";
import { getAllSociosAction } from "@/ui/actions/socio/socio.actions";
import { getRecepcionistasAction } from "@/ui/actions/solicitud-prestamo/solicitud-prestamo.actions";
import { type SearchOption } from "@/ui/components/library-search-select/library-search-select";
import { useMultipleSelector, useSelector } from "@/ui/hooks/use-selector";
import { type SolicitudInterbibliotecariaInicial } from "@/ui/routes/libros/libro-ejemplares";
import { pickData } from "@/ui/routes/use-library-records-viewmodel";
import { opcionesSedeOrigen } from "./sedes-origen";

export function useSelectoresViewModel(
    session: Session,
    interbibliotecaria: boolean,
    solicitudInicial?: SolicitudInterbibliotecariaInicial
) {
    const socio = useSelector("socioId", "Socio", "Buscá por nombre o documento");
    const recepcionista = useSelector("recepcionistaId", "Recepcionista de origen", "Buscá por nombre o apellido");
    const origen = useSelector(
        "sedeOrigenId",
        "Sede de origen",
        "Buscá una sede de origen",
        true,
        solicitudInicial?.sedeOrigenId ? { value: solicitudInicial.sedeOrigenId, label: `Sede #${solicitudInicial.sedeOrigenId}` } : undefined
    );
    const destino = useSelector(
        "sedeDestinoId",
        "Sede de destino",
        "Buscá una sede de destino",
        true,
        solicitudInicial?.sedeDestinoId ? { value: solicitudInicial.sedeDestinoId, label: `Sede #${solicitudInicial.sedeDestinoId}` } : undefined
    );
    const libro = useSelector("libroId", "Título para consultar stock", "Buscá un libro", false);
    const ejemplar = useMultipleSelector(
        "ejemplaresIds",
        "Ejemplares",
        "Buscá por título o código",
        solicitudInicial?.ejemplarId ? [{ value: solicitudInicial.ejemplarId, label: `Ejemplar #${solicitudInicial.ejemplarId}` }] : []
    );
    const filterSede = useSelector("sedeId", "Sede", "Buscá por nombre de sede", false);

    const [revision, setRevision] = useState(0);
    const [catalog, setCatalog] = useState<{
        session: Session;
        socios: ActionState<SearchOption[]>;
        recepcionistas: ActionState<(SearchOption & { sedeId: string })[]>;
        sedes: Awaited<ReturnType<typeof getAllSedesAction>>;
        ejemplares: Awaited<ReturnType<typeof getAllEjemplaresAction>>;
        libros: Awaited<ReturnType<typeof getAllLibrosAction>>;
    } | null>(null);

    {/* ===== Main useEffects ===== */ }

    useEffect(() => {
        let active = true;
        void Promise.all([
            getAllSociosAction({ session, estado: EstadoSocio.HABILITADO }),
            getAllSedesAction({ session }),
            getAllEjemplaresAction({ session, estado: EstadoEjemplar.DISPONIBLE }),
            getAllLibrosAction({ session }),
            getRecepcionistasAction({ session })
        ]).then(([sociosRes, sedesRes, ejemplaresRes, librosRes, recepcionistasRes]) => {
            if (!active) return;
            setCatalog({
                session,
                sedes: sedesRes,
                ejemplares: ejemplaresRes,
                libros: librosRes,
                recepcionistas: pickData(recepcionistasRes, ({ recepcionistas: users }) => users.map(({ id, nombre, apellido, sedeId }) => ({
                    value: id,
                    label: `${nombre} ${apellido}`.trim(),
                    sedeId
                }))),
                socios: pickData(sociosRes, (items) => items.map(({ id, nombre, apellido, documento }) => ({
                    value: id,
                    label: `${nombre} ${apellido} · ${documento}`
                })))
            });
        });
        return () => {
            active = false;
        };
    }, [session, revision]);

    {/* ===== onActions functions ===== */ }

    const onSelectOrigin = (value: string) => {
        ejemplar.reset();
        recepcionista.reset();
        const usuario = session.user;
        if (value && (destino.selected === value || (
            usuario?.roleEntity === Rol.RECEPCIONISTA && usuario.sedeId !== value && usuario.sedeId !== destino.selected
        ))) {
            destino.reset();
        }
    };

    const onOpen = () => {
        socio.reset();
        recepcionista.reset();
        origen.reset();
        destino.reset();
        libro.reset();
        ejemplar.reset();
        setRevision((current) => current + 1);
    };

    const onChangeDestination = () => {
        origen.reset();
        ejemplar.reset();
        recepcionista.reset();
    };

    {/* ===== variables ===== */ }

    const data = catalog?.session === session ? catalog : null;
    const sedes = data?.sedes.data ?? [];
    const sedeNames = new Map(sedes.map(({ id, nombre }) => [id, nombre]));
    const titles = new Map(data?.libros.data?.libros.map(({ id, titulo }) => [id, titulo]));
    const socios = new Map(data?.socios.data?.map(({ value, label }) => [value, label]));
    const recepcionistas = new Map(data?.recepcionistas.data?.map(({ value, label }) => [value, label]));

    const recepcionistaActual = session.user?.roleEntity === Rol.RECEPCIONISTA;
    const sedePropia = session.user?.sedeId;
    const activeSedes = data ? pickData(data.sedes, (items) => items
        .filter(({ estadoEntity }) => estadoEntity === EstadoSede.ACTIVA)
        .map(({ id, nombre }) => ({ value: id, label: nombre }))) : null;

    const copies = data ? pickData(data.ejemplares, ({ ejemplares: copyItems }) => copyItems.map((copy) => ({
        value: copy.id,
        sedeId: copy.sedeId,
        libroId: copy.libroId,
        label: [titles.get(copy.libroId), copy.codigo].filter(Boolean).join(" · ")
    }))) : null;

    const copyNames = new Map(copies?.data?.map(({ value, label }) => [value, label]));

    const destinationField = destino.field(activeSedes, "Cargando sedes...", onChangeDestination);
    const libros = data ? pickData(data.libros, ({ libros: items }) => items.map(({ id, titulo, editorial }) => ({
        value: id,
        label: [titulo, editorial].filter(Boolean).join(" · ")
    }))) : null;

    const eligibleSedes = activeSedes && pickData(activeSedes, (items) => interbibliotecaria
        ? opcionesSedeOrigen(items, copies?.data ?? [], libro.selected, destino.selected,
            recepcionistaActual ? sedePropia : undefined)
        : items.filter(({ value }) => !recepcionistaActual || value === sedePropia));

    const originField = origen.field(
        interbibliotecaria && libro.selected && copies?.success === false
            ? { success: false, error: copies.error }
            : eligibleSedes,
        "Cargando sedes...",
        onSelectOrigin
    );

    if (interbibliotecaria && libro.selected && copies?.success && eligibleSedes?.data?.length === 0) {
        originField.status = "No hay ejemplares disponibles de este título en las sedes de origen.";
    }

    const fields = [
        ...(interbibliotecaria ? [
            destinationField,
            libro.field(libros, "Cargando títulos...")
        ] : []),
        originField,
        ejemplar.field(
            origen.selected && copies ? pickData(copies, (items) => items.filter(({ sedeId, libroId }) =>
                sedeId === origen.selected && (!interbibliotecaria || !libro.selected || libroId === libro.selected)
            )) : null,
            origen.selected ? "Cargando ejemplares..." : "Seleccioná primero la sede de origen."
        )
    ];

    const socioField = socio.field(data?.socios ?? null);
    const recepcionistaField = recepcionista.field(
        origen.selected && data
            ? pickData(data.recepcionistas, (items) => items.filter(({ sedeId }) => sedeId === origen.selected))
            : null,
        origen.selected ? "Cargando recepcionistas..." : "Seleccioná primero la sede de origen."
    );
    const sedeFilter = filterSede.field(data && pickData(data.sedes, (items) => items.map(({ id, nombre }) => ({ value: id, label: nombre }))));

    const canSubmit = Boolean(origen.selected && ejemplar.selected.length);
    const hasSocio = Boolean(socio.selected);
    const hasRecepcionista = Boolean(recepcionista.selected);
    const hasDestination = Boolean(destino.selected);

    return {
        open: onOpen,
        fields,
        socioField,
        recepcionistaField,
        canSubmit,
        hasSocio,
        hasRecepcionista,
        hasDestination,
        sedeFilter,
        sedeNames,
        socios,
        recepcionistas,
        copyNames
    };
}

export default useSelectoresViewModel;
export { useSelectoresViewModel as SelectoresViewModel };
