import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoEjemplar } from "@/domain/entities/devolucion";
import { createDevolucionAction, getAllDevolucionesAction, getDevolucionByIdAction } from "@/ui/actions/devolucion/devolucion.actions";
import { info, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { EstadoPrestamo } from "@/domain/entities/prestamo";
import { useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { pickData } from "@/ui/routes/use-library-records-viewmodel";

const estados = [EstadoEjemplar.DISPONIBLE, EstadoEjemplar.DANADO, EstadoEjemplar.EXTRAVIADO,
    EstadoEjemplar.DESTRUIDO, EstadoEjemplar.EN_REVISION].map((estado) => estado.toOption());

export function useViewModel(session: Session) {
    const catalog = useSelectorCatalog(session, "prestamos", "socios");
    const prestamo = useSelector("prestamoId", "Préstamo", "Buscá por libro, ejemplar o socio");
    const prestamos = catalog?.prestamos && pickData(catalog.prestamos, (items) =>
        items.filter(({ estado }) => estado !== EstadoPrestamo.DEVUELTO));
    const load = useCallback(() => getAllDevolucionesAction({ session }), [session]);
    const loadDetail = useCallback((id: string) => getDevolucionByIdAction({ id, session }), [session]);

    return useLibraryRecordsViewModel({
        title: "Devoluciones", initialFilters: null,
        load, loadDetail,
        getLabel: (devolucion) => `Préstamo ${devolucion.prestamoId} · ${devolucion.estadoDevueltoName}`,
        create: {
            label: "Registrar devolución",
            onOpen: () => { prestamo.reset(); catalog.refresh(); },
            submitDisabled: !prestamo.selected,
            fields: [prestamo.field(prestamos ?? null), { name: "fecha", placeholder: "Seleccioná la fecha de devolución", label: "Fecha de devolución", type: "date", required: true },
                { name: "observaciones", placeholder: "Agregá una observación", label: "Observaciones" }, { name: "estadoDevuelto", label: "Estado del ejemplar", options: estados }],
            submit: (field) => createDevolucionAction({
                session, prestamoId: field("prestamoId"), fecha: field("fecha"), observaciones: field("observaciones") || undefined,
                estadoDevuelto: EstadoEjemplar.fromString(field("estadoDevuelto"))
            })
        },
        describe: (devolucion) => ({
            info: [info("Préstamo", devolucion.prestamoId), info("Fecha", devolucion.fecha),
                info("Estado del ejemplar", devolucion.estadoDevueltoName), info("Observaciones", devolucion.observaciones)]
        })
    });
}
