import { useCallback } from "react";
import { Rol } from "@/domain/entities/rol";
import { localDateISO } from "@/ui/forms/handlers/local-date";
import { type Session } from "@/domain/entities/session";
import { EstadoEjemplar } from "@/domain/entities/devolucion";
import { EstadoPrestamo, ModalidadPrestamoLocal, type Prestamo } from "@/domain/entities/prestamo";
import { createDevolucionAction } from "@/ui/actions/devolucion/devolucion.actions";
import { cancelarPrestamoAction, getAllPrestamosAction, getPrestamoByIdAction, renovarPrestamoAction } from "@/ui/actions/prestamo/prestamo.actions";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { allOptions, info, pickData, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";

function dateKey(value?: string | Date | null) {
    return value instanceof Date ? value.toISOString().slice(0, 10) : value?.slice(0, 10) ?? "";
}

export function useViewModel(session: Session, initialRecordId?: string, onDevolver?: (prestamoId: string) => void) {
    const today = localDateISO();
    const isRecepcionista = session.user?.role === Rol.RECEPCIONISTA;

    const catalog = useSelectorCatalog(session, "sedes", "socios", "ejemplares");
    const socio = useSelector("socioId", "Socio", "Buscá por nombre o documento", false);
    const sede = useSelector("sedeId", "Sede", "Buscá por nombre de sede", false);
    const socioNames = new Map((catalog.socios?.data ?? []).map(({ value, label }) => [value, label]));
    const sedeNames = new Map((catalog.sedes?.data ?? []).map(({ value, label }) => [value, label]));
    const ejemplarNames = new Map((catalog.ejemplares?.data ?? []).map(({ value, label }) => [value, label]));
    const joinEjemplares = (ids: string[]) => ids.map((id) => ejemplarNames.get(id) ?? `#${id}`).join(", ");

    {/* ===== Fetch data ===== */ }

    const fetchPrestamos = useCallback(async ({ socioId, sedeId, estado }: { socioId: string; sedeId: string; estado: string }) => {
        const result = await getAllPrestamosAction({
            session,
            socio_id: socioId,
            sede_id: isRecepcionista ? session.user?.sedeId : sedeId,
            estado
        });
        return pickData(result, (data) => data.prestamos);
    }, [session, isRecepcionista]);

    const fetchPrestamoDetail = useCallback(async (id: string) => {
        const result = await getPrestamoByIdAction(id, session);
        return pickData(result, (data) => data.prestamo);
    }, [session]);

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "socioId", "sedeId", "estado");
    };

    const handleRenovarPrestamo = (prestamo: Prestamo) => {
        return renovarPrestamoAction({ id: prestamo.id, session });
    };

    const handleCancelPrestamo = (prestamo: Prestamo) => {
        return cancelarPrestamoAction({ id: prestamo.id, session });
    };

    const handleDevolverPrestamo = (prestamo: Prestamo) => {
        return createDevolucionAction({
            session,
            prestamoId: prestamo.id,
            fecha: today,
            estadoDevuelto: EstadoEjemplar.DISPONIBLE
        });
    };

    const describePrestamo = (prestamo: Prestamo) => {
        const mismaSede = session.user?.roleEntity !== Rol.RECEPCIONISTA || session.user.sedeId === prestamo.sedeId;
        const activo = prestamo.estadoEntity === EstadoPrestamo.ACTIVO;
        const abierto = activo || prestamo.estadoEntity === EstadoPrestamo.VENCIDO;
        const vencimiento = dateKey(prestamo.fechaVencimiento);
        const pendientes = prestamo.ejemplaresIds.filter((id) => !prestamo.ejemplaresDevueltosIds.includes(id));
        return {
            info: [
                info("Solicitud", prestamo.solicitudId),
                info("Socio", socioNames.get(prestamo.socioId) ?? prestamo.socioId),
                info("Ejemplares", joinEjemplares(prestamo.ejemplaresIds)),
                info("Devueltos", joinEjemplares(prestamo.ejemplaresDevueltosIds)),
                info("Pendientes", joinEjemplares(pendientes)),
                info("Sede", sedeNames.get(prestamo.sedeId) ?? prestamo.sedeId),
                info("Estado", prestamo.estadoName),
                info("Modalidad", prestamo.modalidadName),
                info("Renovaciones", String(prestamo.renovaciones)),
                info("Inicio", prestamo.fechaInicio),
                info("Vencimiento", prestamo.fechaVencimiento),
                info("Devolución", prestamo.fechaDevolucion)
            ],
            commands: [
                ...(mismaSede && activo && prestamo.modalidadEntity === ModalidadPrestamoLocal.DOMICILIO
                    && vencimiento && today <= vencimiento ? [{
                        label: "Renovar préstamo",
                        confirm: "¿Querés extender el vencimiento de este préstamo?",
                        execute: () => handleRenovarPrestamo(prestamo)
                    }] : []),
                ...(mismaSede && activo && prestamo.fechaInicio
                    && dateKey(prestamo.fechaInicio) <= today && today < vencimiento ? [{
                        label: "Cancelar anticipadamente",
                        confirm: "Confirmá que recibiste en buen estado todos los ejemplares pendientes. El préstamo se cerrará y se registrarán sus devoluciones.",
                        execute: () => handleCancelPrestamo(prestamo)
                    }] : []),
                ...(mismaSede && abierto && pendientes.length === 1 && (!vencimiento || today >= vencimiento) ? [{
                        label: "Registrar devolución",
                        confirm: "Confirmá que recibiste el ejemplar pendiente en buen estado.",
                        execute: () => handleDevolverPrestamo(prestamo)
                    }] : [])
            ],
            actions: mismaSede && abierto && pendientes.length > 1 && onDevolver ? [{
                label: "Registrar devolución",
                onClick: () => onDevolver(prestamo.id)
            }] : undefined
        };
    };

    {/* ===== variables ===== */ }

    const getPrestamoLabel = (prestamo: Prestamo) => {
        const socioNombre = socioNames.get(prestamo.socioId) ?? `Socio #${prestamo.socioId}`;
        const copias = joinEjemplares(prestamo.ejemplaresIds);
        return copias ? `${socioNombre} · ${copias}` : `${socioNombre} · Préstamo #${prestamo.id}`;
    };

    const getPrestamoMeta = (prestamo: Prestamo) => {
        const sedeNombre = sedeNames.get(prestamo.sedeId) ?? (prestamo.sedeId ? `Sede #${prestamo.sedeId}` : "");
        const vencimiento = dateKey(prestamo.fechaVencimiento);
        return [
            prestamo.estadoName,
            prestamo.modalidadName,
            sedeNombre,
            vencimiento ? `Vence ${vencimiento}` : undefined
        ].filter(Boolean).join(" · ");
    };

    const filterFields: Field[] = [
        socio.field(catalog?.socios ?? null),
        ...(isRecepcionista ? [] : [sede.field(catalog?.sedes ?? null)]),
        { name: "estado", label: "Estado", options: allOptions(EstadoPrestamo.toOptions()) }
    ];

    return useLibraryRecordsViewModel({
        initialRecordId,
        newestFirst: true,
        title: "Préstamos",
        initialFilters: { socioId: "", sedeId: "", estado: "" },
        load: fetchPrestamos,
        loadDetail: fetchPrestamoDetail,
        filter: {
            label: "Filtrar",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        getLabel: getPrestamoLabel,
        getMeta: getPrestamoMeta,
        describe: describePrestamo
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
