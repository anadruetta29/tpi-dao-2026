import { useCallback } from "react";
import { Rol } from "@/domain/entities/rol";
import { localDateISO } from "@/ui/forms/handlers/local-date";
import { type Session } from "@/domain/entities/session";
import { EstadoPrestamo, ModalidadPrestamoLocal, type Prestamo } from "@/domain/entities/prestamo";
import { cancelarPrestamoAction, getAllPrestamosAction, getPrestamoByIdAction, renovarPrestamoAction } from "@/ui/actions/prestamo/prestamo.actions";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { allOptions, info, pickData, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";

function dateKey(value?: string | Date | null) {
    return value instanceof Date ? value.toISOString().slice(0, 10) : value?.slice(0, 10) ?? "";
}

export function useViewModel(session: Session, initialRecordId?: string) {
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

    const describePrestamo = (prestamo: Prestamo) => {
        const mismaSede = session.user?.roleEntity !== Rol.RECEPCIONISTA || session.user.sedeId === prestamo.sedeId;
        const activo = prestamo.estadoEntity === EstadoPrestamo.ACTIVO;
        const vencimiento = dateKey(prestamo.fechaVencimiento);
        return {
            info: [
                info("Solicitud", prestamo.solicitudId),
                info("Socio", socioNames.get(prestamo.socioId) ?? prestamo.socioId),
                info("Ejemplares", joinEjemplares(prestamo.ejemplaresIds)),
                info("Devueltos", joinEjemplares(prestamo.ejemplaresDevueltosIds)),
                info("Pendientes", joinEjemplares(prestamo.ejemplaresIds.filter((id) => !prestamo.ejemplaresDevueltosIds.includes(id)))),
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
                    }] : [])
            ]
        };
    };

    {/* ===== variables ===== */ }

    const getPrestamoLabel = (prestamo: Prestamo) => {
        return `Préstamo #${prestamo.id} · ${prestamo.modalidadName} · ${prestamo.estadoName}`;
    };

    const filterFields: Field[] = [
        socio.field(catalog?.socios ?? null),
        ...(isRecepcionista ? [] : [sede.field(catalog?.sedes ?? null)]),
        { name: "estado", label: "Estado", options: allOptions(EstadoPrestamo.toOptions()) }
    ];

    return useLibraryRecordsViewModel({
        initialRecordId,
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
        describe: describePrestamo
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
