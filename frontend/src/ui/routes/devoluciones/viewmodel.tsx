import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { Rol } from "@/domain/entities/rol";
import { localDateISO } from "@/ui/forms/handlers/local-date";
import { EstadoEjemplar, type Devolucion } from "@/domain/entities/devolucion";
import { EstadoPrestamo } from "@/domain/entities/prestamo";
import { createDevolucionAction, getAllDevolucionesAction, getDevolucionByIdAction } from "@/ui/actions/devolucion/devolucion.actions";
import { useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { info, pickData, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";
import { type ReadField } from "@/ui/forms/handlers/read-form";

const estados = [
    EstadoEjemplar.DISPONIBLE,
    EstadoEjemplar.DANADO,
    EstadoEjemplar.EXTRAVIADO,
    EstadoEjemplar.DESTRUIDO,
    EstadoEjemplar.EN_REVISION
].map((estado) => estado.toOption());

export function useViewModel(session: Session, prestamoInicialId?: string) {
    const catalog = useSelectorCatalog(session, "prestamos", "socios", "ejemplares");
    const ejemplar = useSelector("ejemplarId", "Ejemplar pendiente", "Buscá por título o código");
    const prestamo = useSelector("prestamoId", "Préstamo", "Buscá por libro, ejemplar o socio", true,
        prestamoInicialId ? { value: prestamoInicialId, label: `Préstamo #${prestamoInicialId}` } : undefined
    );

    {/* ===== Fetch data ===== */ }

    const fetchDevoluciones = useCallback(async () => {
        return getAllDevolucionesAction({ session });
    }, [session]);

    const fetchDevolucionDetail = useCallback(async (id: string) => {
        return getDevolucionByIdAction({ id, session });
    }, [session]);

    {/* ===== onActions functions ===== */ }

    const onOpenCreate = () => {
        prestamo.reset();
        ejemplar.reset();
        catalog.refresh();
    };

    {/* ===== handlers functions ===== */ }

    const handleCreateDevolucion = async (field: ReadField) => {
        const result = await createDevolucionAction({
            session,
            prestamoId: field("prestamoId"),
            ejemplarId: field("ejemplarId") || pendientes[0],
            fecha: field("fecha"),
            observaciones: field("observaciones") || undefined,
            estadoDevuelto: EstadoEjemplar.fromString(field("estadoDevuelto"))
        });
        if (result.success) {
            ejemplar.reset();
            catalog.refresh();
        }
        return result;
    };

    const ejemplarNames = new Map((catalog.ejemplares?.data ?? []).map(({ value, label }) => [value, label]));

    const describeDevolucion = (devolucion: Devolucion) => ({
        info: [
            info("Préstamo", devolucion.prestamoId),
            info("Ejemplar", ejemplarNames.get(devolucion.ejemplarId) ?? devolucion.ejemplarId),
            info("Fecha", devolucion.fecha),
            info("Estado devuelto", devolucion.estadoDevueltoName),
            info(
                "Estado actual del ejemplar",
                devolucion.estadoEjemplar === EstadoEjemplar.RESERVADO
                    ? "Asignado a una reserva (Reservado)"
                    : devolucion.estadoEjemplar?.name
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
        return `Préstamo ${devolucion.prestamoId} · ${devolucion.estadoDevueltoName}`;
    };

    const createFields: Field[] = [
        prestamo.field(availablePrestamos ?? null, undefined, ejemplar.reset),
        ...(pendientes.length > 1 ? [ejemplar.field({ success: true, data: copiasPendientes })] : []),
        { name: "fecha", placeholder: "Seleccioná la fecha de devolución", label: "Fecha de devolución", type: "date",
            defaultValue: localDateISO(), max: localDateISO(), min: String(prestamoSeleccionado?.fechaInicio ?? "").slice(0, 10), required: true },
        { name: "observaciones", placeholder: "Agregá una observación", label: "Observaciones" },
        { name: "estadoDevuelto", label: "Estado del ejemplar", options: estados }
    ];

    return useLibraryRecordsViewModel({
        title: "Devoluciones",
        initiallyOpen: Boolean(prestamoInicialId),
        initialFilters: null,
        load: fetchDevoluciones,
        loadDetail: fetchDevolucionDetail,
        getLabel: getDevolucionLabel,
        create: {
            label: "Registrar devolución",
            onOpen: onOpenCreate,
            submitDisabled: !prestamoSeleccionado || (pendientes.length > 1 && !pendientes.includes(ejemplar.selected)),
            fields: createFields,
            submit: handleCreateDevolucion
        },
        describe: describeDevolucion
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
