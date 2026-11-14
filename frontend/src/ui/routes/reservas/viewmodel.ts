import { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoReserva } from "@/domain/entities/reserva";
import { createReservaAction, getAllReservasAction, getReservaByIdAction, updateReservaEstadoAction } from "@/ui/actions/reserva/reserva.actions";
import { allOptions, info, pickData, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";

import { EstadoEjemplar } from "@/domain/entities/ejemplar";
import { EstadoSede } from "@/domain/entities/sede";
import { EstadoSocio } from "@/domain/entities/socio";
import { useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";

const nextStates = [EstadoReserva.ATENDIDA, EstadoReserva.CANCELADA, EstadoReserva.VENCIDA].map((estado) => estado.toOption());

export function useViewModel(session: Session) {
    const catalog = useSelectorCatalog(session, "libros", "socios", "sedes", "ejemplares");
    const filterLibro = useSelector("libroId", "Libro", "Buscá por título", false);
    const filterSocio = useSelector("socioId", "Socio", "Buscá por nombre o documento", false);
    const filterSede = useSelector("sedeId", "Sede", "Buscá por nombre de sede", false);
    const socio = useSelector("socioId", "Socio", "Buscá por nombre o documento");
    const libro = useSelector("libroId", "Libro", "Buscá por título", false);
    const sede = useSelector("sedeId", "Sede", "Buscá por nombre de sede", false);
    const ejemplar = useSelector("ejemplarId", "Ejemplar", "Buscá por título o código", false);
    const socios = catalog?.socios && pickData(catalog.socios, (items) => items.filter(({ estado }) => estado === EstadoSocio.HABILITADO));
    const sedes = catalog?.sedes && pickData(catalog.sedes, (items) => items.filter(({ estado }) => estado === EstadoSede.ACTIVA));
    const stock = catalog.ejemplares ?? null;
    const copiasEnSede = (stock?.data ?? []).filter((copy) => !sede.selected || copy.sedeId === sede.selected);
    const librosDisponibles = new Set(copiasEnSede
        .filter(({ estado }) => estado === EstadoEjemplar.DISPONIBLE)
        .map(({ libroId }) => libroId));
    const librosReservables = stock?.success && catalog.libros
        ? pickData(catalog.libros, (items) => items.filter(({ value }) => !librosDisponibles.has(value)))
        : stock && { success: false, error: stock.error || "No se pudo comprobar la disponibilidad de los libros." };
    const ejemplares = stock && pickData(stock, () => copiasEnSede.filter((copy) =>
        (copy.estado === EstadoEjemplar.PRESTADO || copy.estado === EstadoEjemplar.EN_TRANSITO)
        && !librosDisponibles.has(copy.libroId) && (!libro.selected || copy.libroId === libro.selected)));
    const libroValido = librosReservables?.data?.some(({ value }) => value === libro.selected);
    const ejemplarValido = ejemplares?.data?.some(({ value }) => value === ejemplar.selected);
    const load = useCallback((filters: { libroId: string; socioId: string; sedeId: string; estado: string }) => getAllReservasAction({
        session, ...filters, estado: filters.estado ? EstadoReserva.fromString(filters.estado) : undefined
    }), [session]);
    const loadDetail = useCallback((id: string) => getReservaByIdAction({ id, session }), [session]);

    return useLibraryRecordsViewModel({
        title: "Reservas", initialFilters: { libroId: "", socioId: "", sedeId: "", estado: "" },
        load, loadDetail,
        filter: { label: "Filtrar", fields: [
            filterLibro.field(catalog?.libros ?? null), filterSocio.field(catalog?.socios ?? null), filterSede.field(catalog?.sedes ?? null),
            { name: "estado", label: "Estado", options: allOptions(EstadoReserva.toOptions()) }
        ], submit: (field) => readFields(field, "libroId", "socioId", "sedeId", "estado") },
        getLabel: (reserva) => `Reserva · ${reserva.estadoName}`,
        create: {
            label: "Registrar reserva",
            onOpen: () => { socio.reset(); libro.reset(); sede.reset(); ejemplar.reset(); catalog.refresh(); },
            submitDisabled: !socio.selected || !(libro.selected ? libroValido : ejemplarValido)
                || Boolean(ejemplar.selected && !ejemplarValido),
            fields: [
                socio.field(socios ?? null),
                sede.field(sedes ?? null, undefined, () => { libro.reset(); ejemplar.reset(); }),
                libro.field(librosReservables, "Comprobando disponibilidad...", ejemplar.reset),
                ejemplar.field(ejemplares)
            ],
            submit: async (field) => {
                const libroId = field("libroId") || undefined;
                const ejemplarId = field("ejemplarId") || undefined;
                return createReservaAction({
                    session, socioId: field("socioId"), libroId, ejemplarId, sedeId: field("sedeId") || undefined
                });
            }
        },
        describe: (reserva) => ({
            info: [info("Fecha", reserva.fecha), info("Estado", reserva.estadoName), info("Socio", reserva.socioId),
                info("Libro", reserva.libroId), info("Ejemplar", reserva.ejemplarId), info("Sede", reserva.sedeId)],
            forms: reserva.estadoEntity === EstadoReserva.ACTIVA ? [{
                label: "Actualizar estado", fields: [{ name: "estado", label: "Nuevo estado", options: nextStates }],
                submit: (field) => updateReservaEstadoAction({ session, id: reserva.id, estado: EstadoReserva.fromString(field("estado")) })
            }] : []
        })
    });
}
