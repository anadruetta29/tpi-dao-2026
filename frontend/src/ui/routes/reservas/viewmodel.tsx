import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoReserva, type Reserva } from "@/domain/entities/reserva";
import { EstadoEjemplar } from "@/domain/entities/ejemplar";
import { EstadoSede } from "@/domain/entities/sede";
import { EstadoSocio } from "@/domain/entities/socio";
import { createReservaAction, getAllReservasAction, getReservaByIdAction, updateReservaEstadoAction } from "@/ui/actions/reserva/reserva.actions";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { allOptions, info, pickData, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";

const nextStates = [
    EstadoReserva.ATENDIDA,
    EstadoReserva.CANCELADA,
    EstadoReserva.VENCIDA
].map((estado) => estado.toOption());

export function useViewModel(session: Session) {
    const catalog = useSelectorCatalog(session, "libros", "socios", "sedes", "ejemplares");
    const filterLibro = useSelector("libroId", "Libro", "Buscá por título", false);
    const filterSocio = useSelector("socioId", "Socio", "Buscá por nombre o documento", false);
    const filterSede = useSelector("sedeId", "Sede", "Buscá por nombre de sede", false);

    const socio = useSelector("socioId", "Socio", "Buscá por nombre o documento");
    const libro = useSelector("libroId", "Libro", "Buscá por título", false);
    const sede = useSelector("sedeId", "Sede", "Buscá por nombre de sede", false);
    const ejemplar = useSelector("ejemplarId", "Ejemplar", "Buscá por título o código", false);

    {/* ===== Fetch data ===== */ }

    const fetchReservas = useCallback((filters: { libroId: string; socioId: string; sedeId: string; estado: string }) => {
        return getAllReservasAction({
            session,
            ...filters,
            estado: filters.estado ? EstadoReserva.fromString(filters.estado) : undefined
        });
    }, [session]);

    const fetchReservaDetail = useCallback((id: string) => {
        return getReservaByIdAction({ id, session });
    }, [session]);

    {/* ===== onActions functions ===== */ }

    const onOpenCreate = () => {
        socio.reset();
        libro.reset();
        sede.reset();
        ejemplar.reset();
        catalog.refresh();
    };

    const onChangeSede = () => {
        libro.reset();
        ejemplar.reset();
    };

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "libroId", "socioId", "sedeId", "estado");
    };

    const handleCreateReserva = async (field: ReadField) => {
        const libroId = field("libroId") || undefined;
        const ejemplarId = field("ejemplarId") || undefined;
        return createReservaAction({
            session,
            socioId: field("socioId"),
            libroId,
            ejemplarId,
            sedeId: field("sedeId") || undefined
        });
    };

    const handleUpdateEstado = (reservaId: string, field: ReadField) => {
        return updateReservaEstadoAction({
            session,
            id: reservaId,
            estado: EstadoReserva.fromString(field("estado"))
        });
    };

    const describeReserva = (reserva: Reserva) => ({
        info: [
            info("Fecha", reserva.fecha),
            info("Estado", reserva.estadoName),
            info("Socio", reserva.socioId),
            info("Libro", reserva.libroId),
            info("Ejemplar", reserva.ejemplarId),
            info("Sede", reserva.sedeId)
        ],
        forms: reserva.estadoEntity === EstadoReserva.ACTIVA ? [{
            label: "Actualizar estado",
            fields: [{ name: "estado", label: "Nuevo estado", options: nextStates }],
            submit: (field: ReadField) => handleUpdateEstado(reserva.id, field)
        }] : []
    });

    {/* ===== variables ===== */ }

    const socios = catalog?.socios ? pickData(catalog.socios, (items) =>
        items.filter(({ estado }) => estado === EstadoSocio.HABILITADO)
    ) : null;

    const sedes = catalog?.sedes ? pickData(catalog.sedes, (items) =>
        items.filter(({ estado }) => estado === EstadoSede.ACTIVA)
    ) : null;

    const stock = catalog.ejemplares ?? null;

    const copiasEnSede = (stock?.data ?? []).filter((copy) => !sede.selected || copy.sedeId === sede.selected);

    const librosDisponibles = new Set(
        copiasEnSede
            .filter(({ estado }) => estado === EstadoEjemplar.DISPONIBLE)
            .map(({ libroId }) => libroId)
    );

    const librosReservables = stock?.success && catalog.libros
        ? pickData(catalog.libros, (items) => items.filter(({ value }) => !librosDisponibles.has(value)))
        : stock ? { success: false, error: stock.error || "No se pudo comprobar la disponibilidad de los libros." } : null;

    const ejemplares = stock ? pickData(stock, () =>
        copiasEnSede.filter((copy) =>
            (copy.estado === EstadoEjemplar.PRESTADO || copy.estado === EstadoEjemplar.EN_TRANSITO)
            && !librosDisponibles.has(copy.libroId)
            && (!libro.selected || copy.libroId === libro.selected)
        )
    ) : null;

    const libroValido = Boolean(
        librosReservables && "data" in librosReservables && librosReservables.data?.some(({ value }) => value === libro.selected)
    );

    const ejemplarValido = Boolean(
        ejemplares?.data?.some(({ value }) => value === ejemplar.selected)
    );

    const getReservaLabel = (reserva: Reserva) => `Reserva · ${reserva.estadoName}`;

    const filterFields: Field[] = [
        filterLibro.field(catalog?.libros ?? null),
        filterSocio.field(catalog?.socios ?? null),
        filterSede.field(catalog?.sedes ?? null),
        { name: "estado", label: "Estado", options: allOptions(EstadoReserva.toOptions()) }
    ];

    const createFields: Field[] = [
        socio.field(socios ?? null),
        sede.field(sedes ?? null, undefined, onChangeSede),
        libro.field(librosReservables, "Comprobando disponibilidad...", ejemplar.reset),
        ejemplar.field(ejemplares)
    ];

    const submitDisabled = !socio.selected
        || !(libro.selected ? libroValido : ejemplarValido)
        || Boolean(ejemplar.selected && !ejemplarValido);

    return useLibraryRecordsViewModel({
        title: "Reservas",
        initialFilters: { libroId: "", socioId: "", sedeId: "", estado: "" },
        load: fetchReservas,
        loadDetail: fetchReservaDetail,
        filter: {
            label: "Filtrar",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        getLabel: getReservaLabel,
        create: {
            label: "Registrar reserva",
            onOpen: onOpenCreate,
            submitDisabled,
            fields: createFields,
            submit: handleCreateReserva
        },
        describe: describeReserva
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
