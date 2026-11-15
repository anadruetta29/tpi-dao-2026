import { useEffect, useState } from "react";
import { type ActionState } from "@/core/types";
import { EstadoEjemplar } from "@/domain/entities/ejemplar";
import { EstadoSede } from "@/domain/entities/sede";
import { EstadoSocio } from "@/domain/entities/socio";
import { type Session } from "@/domain/entities/session";
import { getAllEjemplaresAction } from "@/ui/actions/ejemplar/ejemplar.actions";
import { getAllLibrosAction } from "@/ui/actions/libro/libro.actions";
import { getAllSedesAction } from "@/ui/actions/sede/sede.actions";
import { getAllSociosAction } from "@/ui/actions/socio/socio.actions";
import { getRecepcionistasAction } from "@/ui/actions/solicitud-prestamo/solicitud-prestamo.actions";
import { type SearchOption } from "@/ui/components/library-search-select/library-search-select";
import { useSelector } from "@/ui/hooks/use-selector";
import { pickData } from "@/ui/routes/use-library-records-viewmodel";

export function useSelectoresViewModel(session: Session) {
    const socio = useSelector("socioId", "Socio", "Buscá por nombre o documento");
    const recepcionista = useSelector("recepcionistaId", "Recepcionista", "Buscá por nombre o apellido");
    const origen = useSelector("sedeOrigenId", "Sede de origen", "Buscá una sede de origen");
    const destino = useSelector("sedeDestinoId", "Sede de destino", "Buscá una sede de destino");
    const ejemplar = useSelector("ejemplarId", "Ejemplar", "Buscá por título o código");
    const filterSede = useSelector("sedeId", "Sede", "Buscá por nombre de sede", false);

    const [revision, setRevision] = useState(0);
    const [catalog, setCatalog] = useState<{
        session: Session;
        socios: ActionState<SearchOption[]>;
        recepcionistas: ActionState<SearchOption[]>;
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
                recepcionistas: pickData(recepcionistasRes, ({ recepcionistas: users }) => users.map(({ id, nombre, apellido }) => ({
                    value: id,
                    label: `${nombre} ${apellido}`.trim()
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
        if (value && destino.selected === value) {
            destino.reset();
        }
    };

    const onOpen = () => {
        socio.reset();
        recepcionista.reset();
        origen.reset();
        destino.reset();
        ejemplar.reset();
        setRevision((current) => current + 1);
    };

    {/* ===== variables ===== */ }

    const data = catalog?.session === session ? catalog : null;
    const sedes = data?.sedes.data ?? [];
    const sedeNames = new Map(sedes.map(({ id, nombre }) => [id, nombre]));
    const titles = new Map(data?.libros.data?.libros.map(({ id, titulo }) => [id, titulo]));
    const socios = new Map(data?.socios.data?.map(({ value, label }) => [value, label]));
    const recepcionistas = new Map(data?.recepcionistas.data?.map(({ value, label }) => [value, label]));

    const activeSedes = data ? pickData(data.sedes, (items) => items
        .filter(({ estadoEntity }) => estadoEntity === EstadoSede.ACTIVA)
        .map(({ id, nombre }) => ({ value: id, label: nombre }))) : null;

    const copies = data ? pickData(data.ejemplares, ({ ejemplares: copyItems }) => copyItems.map((copy) => ({
        value: copy.id,
        sedeId: copy.sedeId,
        label: [titles.get(copy.libroId), copy.codigo].filter(Boolean).join(" · ")
    }))) : null;

    const copyNames = new Map(copies?.data?.map(({ value, label }) => [value, label]));

    const fields = [
        origen.field(activeSedes, "Cargando sedes...", onSelectOrigin),
        ejemplar.field(
            origen.selected && copies ? pickData(copies, (items) => items.filter(({ sedeId }) => sedeId === origen.selected)) : null,
            origen.selected ? "Cargando ejemplares..." : "Seleccioná primero la sede de origen."
        )
    ];

    const destinationField = destino.field(activeSedes && pickData(activeSedes, (items) => items.filter(({ value }) => value !== origen.selected)));
    const socioField = socio.field(data?.socios ?? null);
    const recepcionistaField = recepcionista.field(data?.recepcionistas ?? null);
    const sedeFilter = filterSede.field(data && pickData(data.sedes, (items) => items.map(({ id, nombre }) => ({ value: id, label: nombre }))));

    const canSubmit = Boolean(origen.selected && ejemplar.selected);
    const hasSocio = Boolean(socio.selected);
    const hasRecepcionista = Boolean(recepcionista.selected);
    const hasDestination = Boolean(destino.selected);

    return {
        open: onOpen,
        fields,
        destinationField,
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
