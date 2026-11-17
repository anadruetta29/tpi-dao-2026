import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import type { DestinoBandeja } from "@/core/types";
import { Rol } from "@/domain/entities/rol";
import { localDateISO } from "@/ui/forms/handlers/local-date";
import { EstadoEjemplar, type Devolucion } from "@/domain/entities/devolucion";
import { EstadoPrestamo } from "@/domain/entities/prestamo";
import { createDevolucionAction, getAllDevolucionesAction, getDevolucionByIdAction } from "@/ui/actions/devolucion/devolucion.actions";
import { useMultipleSelector, useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { allOptions, info, statusInfo, pickData, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField, type ReadFieldValues } from "@/ui/forms/handlers/read-form";
import { estados } from "@/core/utils/constants";

export default function ViewModel(session: Session, prestamoInicialId?: string, onOpen?: (target: DestinoBandeja) => void) {
    const catalog = useSelectorCatalog(session, "prestamos", "socios", "ejemplares");
    const socioFilter = useSelector("socioId", "Socio", "Buscá por nombre o documento", false);
    const ejemplares = useMultipleSelector("ejemplaresIds", "Ejemplares a devolver", "Buscá por título o código");
    const prestamo = useSelector("prestamoId", "Préstamo", "Buscá por libro, ejemplar o socio", true,
        prestamoInicialId ? { value: prestamoInicialId, label: `Préstamo #${prestamoInicialId}` } : undefined
    );

    {/* ===== Fetch data ===== */ }

    const fetchDevoluciones = useCallback(async ({ socioId, estadoDevuelto }: { socioId: string; estadoDevuelto: string }) => {
        return getAllDevolucionesAction({
            session,
            socioId: socioId.trim() || undefined,
            estadoDevuelto: estadoDevuelto || undefined
        });
    }, [session]);

    const fetchDevolucionDetail = useCallback(async (id: string) => {
        return getDevolucionByIdAction({ id, session });
    }, [session]);

    {/* ===== onActions functions ===== */ }

    const onOpenCreate = () => {
        prestamo.reset();
        ejemplares.reset();
        catalog.refresh();
    };

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "socioId", "estadoDevuelto");
    };

    const handleCreateDevolucion = async (field: ReadField, values: ReadFieldValues) => {
        const selectedIds = pendientes.length > 1
            ? values("ejemplaresIds").filter(Boolean)
            : pendientes;
        const result = await createDevolucionAction({
            session,
            prestamoId: field("prestamoId"),
            ejemplarIds: selectedIds,
            fecha: field("fecha"),
            observaciones: field("observaciones") || undefined,
            estadoDevuelto: EstadoEjemplar.fromString(field("estadoDevuelto"))
        });
        if (result.success) {
            ejemplares.reset();
            catalog.refresh();
        }
        return result;
    };

    const ejemplarNames = new Map((catalog.ejemplares?.data ?? []).map(({ value, label }) => [value, label]));

    const describeDevolucion = (devolucion: Devolucion) => ({
        actions: onOpen && devolucion.prestamoId ? [{ label: "Abrir préstamo", onClick: () => onOpen({ modulo: "Préstamos", id: devolucion.prestamoId }) }] : [],
        info: [
            info("Préstamo", devolucion.prestamoId),
            info("Ejemplar", ejemplarNames.get(devolucion.ejemplarId) ?? devolucion.ejemplarId),
            info("Fecha", devolucion.fecha),
            statusInfo(devolucion.estadoDevueltoName, undefined, "Estado devuelto"),
            statusInfo(
                devolucion.estadoEjemplar === EstadoEjemplar.RESERVADO
                    ? "Asignado a una reserva (Reservado)"
                    : devolucion.estadoEjemplar?.name,
                devolucion.estadoEjemplar === EstadoEjemplar.RESERVADO ? "active" : undefined,
                "Estado actual del ejemplar"
            ),
            info("Observaciones", devolucion.observaciones)
        ]
    });

    {/* ===== variables ===== */ }

    const availablePrestamos = catalog?.prestamos ? pickData(catalog.prestamos, (items) =>
        items.filter(({ estado, sedeId }) => estado !== EstadoPrestamo.DEVUELTO
            && (session.user?.roleEntity !== Rol.RECEPCIONISTA || session.user.sedeId === sedeId))
    ) : null;

    const prestamoSeleccionado = availablePrestamos?.data?.find(({ value }) => value === prestamo.selected);
    const pendientes = prestamoSeleccionado?.pendientes ?? [];
    const copiasPendientes = pendientes.map((id) => catalog.ejemplares?.data?.find(({ value }) => value === id)
        ?? { value: id, label: `Ejemplar #${id}` });

    const getDevolucionLabel = (devolucion: Devolucion) => {
        const copia = devolucion.ejemplarId ? (ejemplarNames.get(devolucion.ejemplarId) ?? `Ejemplar #${devolucion.ejemplarId}`) : undefined;
        return copia ?? `Préstamo #${devolucion.prestamoId}`;
    };

    const getDevolucionMeta = (devolucion: Devolucion) => {
        const fecha = devolucion.fecha ? String(devolucion.fecha).slice(0, 10) : undefined;
        return [`Préstamo #${devolucion.prestamoId}`, fecha, devolucion.observaciones || undefined].filter(Boolean).join(" · ");
    };

    const filterFields: Field[] = [
        socioFilter.field(catalog?.socios ?? null),
        { name: "estadoDevuelto", label: "Estado devuelto", options: allOptions(estados) }
    ];

    const createFields: Field[] = [
        prestamo.field(availablePrestamos ?? null, undefined, ejemplares.reset),
        ...(pendientes.length > 1 ? [ejemplares.field({ success: true, data: copiasPendientes })] : []),
        { name: "fecha", placeholder: "Seleccioná la fecha de devolución", label: "Fecha de devolución", type: "date",
            defaultValue: localDateISO(), max: localDateISO(), min: String(prestamoSeleccionado?.fechaInicio ?? "").slice(0, 10), required: true },
        { name: "observaciones", placeholder: "Agregá una observación", label: "Observaciones" },
        { name: "estadoDevuelto", label: "Estado del ejemplar", options: estados }
    ];

    return useLibraryRecordsViewModel({
        title: "Devoluciones",
        newestFirst: true,
        initiallyOpen: Boolean(prestamoInicialId),
        initialFilters: { socioId: "", estadoDevuelto: "" },
        load: fetchDevoluciones,
        loadDetail: fetchDevolucionDetail,
        filter: {
            label: "Filtrar devoluciones",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        getLabel: getDevolucionLabel,
        getMeta: getDevolucionMeta,
        getStatuses: (devolucion) => [devolucion.estadoDevueltoName],
        create: {
            label: "Registrar devolución",
            onOpen: onOpenCreate,
            submitDisabled: !prestamoSeleccionado || (pendientes.length > 1 && ejemplares.selected.length === 0),
            fields: createFields,
            submit: handleCreateDevolucion
        },
        describe: describeDevolucion
    });
}
