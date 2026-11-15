import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
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

export function useViewModel(session: Session) {
    const catalog = useSelectorCatalog(session, "prestamos", "socios");
    const prestamo = useSelector("prestamoId", "Préstamo", "Buscá por libro, ejemplar o socio");

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
        catalog.refresh();
    };

    {/* ===== handlers functions ===== */ }

    const handleCreateDevolucion = async (field: ReadField) => {
        return createDevolucionAction({
            session,
            prestamoId: field("prestamoId"),
            fecha: field("fecha"),
            observaciones: field("observaciones") || undefined,
            estadoDevuelto: EstadoEjemplar.fromString(field("estadoDevuelto"))
        });
    };

    const describeDevolucion = (devolucion: Devolucion) => ({
        info: [
            info("Préstamo", devolucion.prestamoId),
            info("Fecha", devolucion.fecha),
            info("Estado del ejemplar", devolucion.estadoDevueltoName),
            info("Observaciones", devolucion.observaciones)
        ]
    });

    {/* ===== variables ===== */ }

    const availablePrestamos = catalog?.prestamos ? pickData(catalog.prestamos, (items) =>
        items.filter(({ estado }) => estado !== EstadoPrestamo.DEVUELTO)
    ) : null;

    const getDevolucionLabel = (devolucion: Devolucion) => {
        return `Préstamo ${devolucion.prestamoId} · ${devolucion.estadoDevueltoName}`;
    };

    const createFields: Field[] = [
        prestamo.field(availablePrestamos ?? null),
        { name: "fecha", placeholder: "Seleccioná la fecha de devolución", label: "Fecha de devolución", type: "date", required: true },
        { name: "observaciones", placeholder: "Agregá una observación", label: "Observaciones" },
        { name: "estadoDevuelto", label: "Estado del ejemplar", options: estados }
    ];

    return useLibraryRecordsViewModel({
        title: "Devoluciones",
        initialFilters: null,
        load: fetchDevoluciones,
        loadDetail: fetchDevolucionDetail,
        getLabel: getDevolucionLabel,
        create: {
            label: "Registrar devolución",
            onOpen: onOpenCreate,
            submitDisabled: !prestamo.selected,
            fields: createFields,
            submit: handleCreateDevolucion
        },
        describe: describeDevolucion
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
