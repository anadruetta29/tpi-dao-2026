import { useEffect, useState } from "react";
import { type ActionState, type SolicitudInterbibliotecariaInicial } from "@/core/types";
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
import { pickData } from "@/ui/routes/use-library-records-viewmodel";

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
            getAllEjemplaresAction({ session }),
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
        libro.reset();
        ejemplar.reset();
        recepcionista.reset();
        const usuario = session.user;
        if (value && (destino.selected === value || (
            usuario?.roleEntity === Rol.RECEPCIONISTA && usuario.sedeId !== value && usuario.sedeId !== destino.selected
        ))) {
            destino.reset();
        }
    };

    const reset = () => {
        socio.reset();
        recepcionista.reset();
        origen.reset();
        destino.reset();
        libro.reset();
        ejemplar.reset();
    };

    const onOpen = () => {
        reset();
        setRevision((current) => current + 1);
    };

    const onChangeDestination = () => {
        ejemplar.reset();
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

    const allCopies = data ? pickData(data.ejemplares, ({ ejemplares: copyItems }) => copyItems.map((copy) => ({
        value: copy.id,
        sedeId: copy.sedeId,
        libroId: copy.libroId,
        estadoEntity: copy.estado,
        title: titles.get(copy.libroId) ?? "",
        label: [titles.get(copy.libroId), copy.codigo].filter(Boolean).join(" · ")
    }))) : null;

    const copies = allCopies ? pickData(allCopies, (items) =>
        items.filter(({ estadoEntity }) => estadoEntity === EstadoEjemplar.DISPONIBLE)
    ) : null;

    const copyNames = new Map(allCopies?.data?.map(({ value, label }) => [value, label]));
    const copyTitles = new Map(allCopies?.data?.map(({ value, title }) => [value, title]));

    const eligibleDestinationSedes = activeSedes && pickData(activeSedes, (items) =>
        items.filter(({ value }) =>
            value !== origen.selected
            && (!recepcionistaActual || !origen.selected || origen.selected === sedePropia || value === sedePropia)
        )
    );
    const destinationField = destino.field(eligibleDestinationSedes, "Cargando sedes...", onChangeDestination);
    const availableLibroIdsInOrigin = new Set((copies?.data ?? []).filter(({ sedeId }) => sedeId === origen.selected).map(({ libroId }) => libroId));
    const libros = origen.selected && data ? pickData(data.libros, ({ libros: items }) => items.filter(({ id }) => availableLibroIdsInOrigin.has(id)).map(({ id, titulo, editorial }) => ({ value: id, label: [titulo, editorial].filter(Boolean).join(" · ") }))) : null;

    const eligibleSedes = activeSedes && pickData(activeSedes, (items) => interbibliotecaria ? items : items.filter(({ value }) => !recepcionistaActual || value === sedePropia));

    const originField = origen.field(eligibleSedes, "Cargando sedes...", onSelectOrigin);
    const libroField = libro.field(libros, origen.selected ? "Cargando títulos..." : "Seleccioná primero la sede de origen.");
    if (interbibliotecaria && origen.selected && libros?.success && libros.data?.length === 0) {
        libroField.status = "No hay ejemplares disponibles en la sede de origen.";
    }

    const fields = [
        originField,
        ...(interbibliotecaria ? [
            destinationField,
            libroField
        ] : []),
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
        reset,
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
        copyNames,
        copyTitles
    };
}

export default useSelectoresViewModel;
export { useSelectoresViewModel as SelectoresViewModel };
