import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { Rol } from "@/domain/entities/rol";
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


export default function ViewModel(session: Session, initialRecordId?: string) {
    const estadosActiva = [EstadoReserva.CANCELADA].map((estado) => estado.toOption());
    const estadosListaRetiro = [EstadoReserva.RETIRADA, EstadoReserva.CANCELADA].map((estado) => estado.toOption());

    const isRecepcionista = session.user?.role === Rol.RECEPCIONISTA;
    const catalog = useSelectorCatalog(session, "libros", "socios", "sedes", "ejemplares");
    const filterLibro = useSelector("libroId", "Libro", "Buscá por título", false);
    const filterSocio = useSelector("socioId", "Socio", "Buscá por nombre o documento", false);
    const filterSede = useSelector("sedeId", "Sede", "Buscá por nombre de sede", false);

    const socio = useSelector("socioId", "Socio", "Buscá por nombre o documento");
    const libro = useSelector("libroId", "Libro", "Buscá por título");
    const sede = useSelector("sedeId", "Sede", "Buscá por nombre de sede", false);

    {/* ===== Fetch data ===== */ }

    const fetchReservas = useCallback((filters: { libroId: string; socioId: string; sedeId: string; estado: string }) => {
        return getAllReservasAction({
            session,
            ...filters,
            sedeId: isRecepcionista ? session.user?.sedeId : filters.sedeId,
            estado: filters.estado ? EstadoReserva.fromString(filters.estado) : undefined
        });
    }, [session, isRecepcionista]);

    const fetchReservaDetail = useCallback((id: string) => {
        return getReservaByIdAction({ id, session });
    }, [session]);

    {/* ===== onActions functions ===== */ }

    const onOpenCreate = () => {
        socio.reset();
        libro.reset();
        sede.reset();
        catalog.refresh();
    };

    const onChangeSede = () => {
        libro.reset();
    };

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "libroId", "socioId", "sedeId", "estado");
    };

    const handleCreateReserva = async (field: ReadField) => {
        return createReservaAction({
            session,
            socioId: field("socioId"),
            libroId: field("libroId"),
            sedeId: isRecepcionista ? undefined : (field("sedeId") || undefined)
        });
    };

    const handleUpdateEstado = (reservaId: string, field: ReadField) => {
        return updateReservaEstadoAction({
            session,
            id: reservaId,
            estado: EstadoReserva.fromString(field("estado"))
        });
    };

    const describeReserva = (reserva: Reserva) => {
        const socioNames = new Map((catalog.socios?.data ?? []).map(({ value, label }) => [value, label]));
        const libroNames = new Map((catalog.libros?.data ?? []).map(({ value, label }) => [value, label]));
        const sedeNames = new Map((catalog.sedes?.data ?? []).map(({ value, label }) => [value, label]));
        const ejemplarNames = new Map((catalog.ejemplares?.data ?? []).map(({ value, label }) => [value, label]));
        const opcionesEstado = reserva.estadoEntity === EstadoReserva.LISTA_PARA_RETIRO
            ? estadosListaRetiro
            : reserva.estadoEntity === EstadoReserva.ACTIVA
                ? estadosActiva
                : null;
        return {
            info: [
                info("Fecha", reserva.fecha),
                info("Estado", reserva.estadoName),
                info("Límite de retiro", reserva.fechaLimiteRetiro),
                info("Préstamo generado", reserva.prestamoId),
                info("Socio", socioNames.get(reserva.socioId) ?? reserva.socioId),
                info("Libro", libroNames.get(reserva.libroId) ?? reserva.libroId),
                info("Ejemplar", ejemplarNames.get(reserva.ejemplarId) ?? reserva.ejemplarId),
                info("Sede", sedeNames.get(reserva.sedeId) ?? reserva.sedeId)
            ],
            forms: opcionesEstado ? [{
                label: "Actualizar estado",
                fields: [{ name: "estado", label: "Nuevo estado", options: opcionesEstado }],
                submit: (field: ReadField) => handleUpdateEstado(reserva.id, field)
            }] : []
        };
    };

    {/* ===== variables ===== */ }

    const socios = catalog?.socios ? pickData(catalog.socios, (items) =>
        items.filter(({ estado }) => estado === EstadoSocio.HABILITADO)
    ) : null;

    const sedes = catalog?.sedes ? pickData(catalog.sedes, (items) =>
        items.filter(({ estado }) => estado === EstadoSede.ACTIVA)
    ) : null;

    const stock = catalog.ejemplares ?? null;

    const sedeEfectiva = isRecepcionista ? (session.user?.sedeId ?? "") : sede.selected;

    const copiasEnSede = (stock?.data ?? []).filter((copy) => !sedeEfectiva || copy.sedeId === sedeEfectiva);

    const librosDisponibles = new Set(
        copiasEnSede
            .filter(({ estado }) => estado === EstadoEjemplar.DISPONIBLE)
            .map(({ libroId }) => libroId)
    );

    const librosReservables = stock?.success && catalog.libros
        ? pickData(catalog.libros, (items) => items.filter(({ value }) => !librosDisponibles.has(value)))
        : stock ? { success: false, error: stock.error || "No se pudo comprobar la disponibilidad de los libros." } : null;

    const libroValido = Boolean(
        librosReservables && "data" in librosReservables && librosReservables.data?.some(({ value }) => value === libro.selected)
    );

    const socioNames = new Map((catalog.socios?.data ?? []).map(({ value, label }) => [value, label]));
    const libroNames = new Map((catalog.libros?.data ?? []).map(({ value, label }) => [value, label]));
    const sedeNames = new Map((catalog.sedes?.data ?? []).map(({ value, label }) => [value, label]));

    const getReservaLabel = (reserva: Reserva) => {
        const socioNombre = socioNames.get(reserva.socioId) ?? `Socio #${reserva.socioId}`;
        const libroTitulo = libroNames.get(reserva.libroId) ?? `Libro #${reserva.libroId}`;
        return `${socioNombre} · ${libroTitulo}`;
    };

    const getReservaMeta = (reserva: Reserva) => {
        const sedeNombre = reserva.sedeId ? (sedeNames.get(reserva.sedeId) ?? `Sede #${reserva.sedeId}`) : undefined;
        const fecha = reserva.fecha ? String(reserva.fecha).slice(0, 10) : undefined;
        const retiro = reserva.fechaLimiteRetiro ? `Retiro hasta ${String(reserva.fechaLimiteRetiro).slice(0, 10)}` : undefined;
        return [reserva.estadoName, sedeNombre, retiro ?? fecha].filter(Boolean).join(" · ");
    };

    const filterFields: Field[] = [
        filterLibro.field(catalog?.libros ?? null),
        filterSocio.field(catalog?.socios ?? null),
        ...(isRecepcionista ? [] : [filterSede.field(catalog?.sedes ?? null)]),
        { name: "estado", label: "Estado", options: allOptions(EstadoReserva.toOptions()) }
    ];

    const createFields: Field[] = [
        socio.field(socios ?? null),
        ...(isRecepcionista ? [] : [sede.field(sedes ?? null, undefined, onChangeSede)]),
        libro.field(librosReservables, "Comprobando disponibilidad...")
    ];

    const submitDisabled = !socio.selected || !libroValido;

    return useLibraryRecordsViewModel({
        initialRecordId,
        newestFirst: true,
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
        getMeta: getReservaMeta,
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
