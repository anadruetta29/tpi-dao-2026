import { useCallback, useState } from "react";
import { type Session } from "@/domain/entities/session";
import { Rol } from "@/domain/entities/rol";
import { EstadoPrestamo, ModalidadPrestamoLocal, type Prestamo } from "@/domain/entities/prestamo";
import { EstadoSolicitud, TipoPrestamo } from "@/domain/entities/solicitud-prestamo";
import { cancelarPrestamoAction, createPrestamoAction, getAllPrestamosAction, getPrestamoByIdAction } from "@/ui/actions/prestamo/prestamo.actions";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { useSelector } from "@/ui/hooks/use-selector";
import { useSelectorCatalog } from "@/ui/hooks/use-selector-catalog";
import { allOptions, info, pickData, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";

function localDateISO() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

function dateKey(value?: string | Date | null) {
    return value instanceof Date ? value.toISOString().slice(0, 10) : value?.slice(0, 10) ?? "";
}

export function useViewModel(session: Session) {
    const [today, setToday] = useState(localDateISO);
    const [startDate, setStartDate] = useState("");
    const [isInterbibliotecaria, setIsInterbibliotecaria] = useState(false);
    const isRecepcionista = session.user?.role === Rol.RECEPCIONISTA;

    const catalog = useSelectorCatalog(session, "sedes", "socios", "solicitudes", "prestamos");
    const socio = useSelector("socioId", "Socio", "Buscá por nombre o documento", false);
    const sede = useSelector("sedeId", "Sede", "Buscá por nombre de sede", false);
    const solicitud = useSelector("solicitudId", "Solicitud aprobada", "Buscá por número, libro o socio");

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

    {/* ===== onActions functions ===== */ }

    const onOpenCreate = () => {
        solicitud.reset();
        catalog.refresh();
        setToday(localDateISO());
        setStartDate("");
        setIsInterbibliotecaria(false);
    };

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "socioId", "sedeId", "estado");
    };

    const handleCreatePrestamo = async (field: ReadField) => {
        const fechaInicio = field("fechaInicio");
        const fechaVencimiento = field("fechaVencimiento") || undefined;
        if (fechaInicio < localDateISO()) {
            return { success: false, error: "La fecha de inicio debe ser hoy o posterior." };
        }
        if (fechaVencimiento && fechaVencimiento < fechaInicio) {
            return { success: false, error: "La fecha de vencimiento no puede ser anterior al inicio." };
        }
        const modalidad = isInterbibliotecaria
            ? ModalidadPrestamoLocal.DOMICILIO
            : ModalidadPrestamoLocal.fromString(field("modalidad"));
        return createPrestamoAction({
            session,
            solicitud_id: field("solicitudId"),
            modalidad,
            fechaInicio,
            fechaVencimiento
        });
    };

    const handleCancelPrestamo = (prestamo: Prestamo) => {
        return cancelarPrestamoAction({ id: prestamo.id, session });
    };

    const describePrestamo = (prestamo: Prestamo) => ({
        info: [
            info("Solicitud", prestamo.solicitudId),
            info("Socio", prestamo.socioId),
            info("Ejemplar", prestamo.ejemplarId),
            info("Sede", prestamo.sedeId),
            info("Estado", prestamo.estadoName),
            info("Modalidad", prestamo.modalidadName),
            info("Inicio", prestamo.fechaInicio),
            info("Vencimiento", prestamo.fechaVencimiento),
            info("Devolución", prestamo.fechaDevolucion)
        ],
        commands: prestamo.estadoEntity === EstadoPrestamo.ACTIVO && prestamo.fechaInicio
            && dateKey(prestamo.fechaInicio) <= today && today < dateKey(prestamo.fechaVencimiento) ? [{
                label: "Cancelar anticipadamente",
                confirm: "Confirmá que recibiste el ejemplar en buen estado. El préstamo se cerrará y se registrará la devolución.",
                execute: () => handleCancelPrestamo(prestamo)
            }] : []
    });

    {/* ===== variables ===== */ }

    const availableSolicitudes = catalog?.solicitudes ? pickData(catalog.solicitudes, (items) =>
        items.filter(({ estado, value }) =>
            estado === EstadoSolicitud.APROBADA
            && !catalog.prestamos?.data?.some(({ solicitudId }) => solicitudId === value)
        )
    ) : null;

    const getPrestamoLabel = (prestamo: Prestamo) => {
        return `Préstamo · ${prestamo.modalidadName} · ${prestamo.estadoName}`;
    };

    const filterFields: Field[] = [
        socio.field(catalog?.socios ?? null),
        ...(isRecepcionista ? [] : [sede.field(catalog?.sedes ?? null)]),
        { name: "estado", label: "Estado", options: allOptions(EstadoPrestamo.toOptions()) }
    ];

    const createFields: Field[] = [
        solicitud.field(availableSolicitudes ?? null, undefined, (value) => {
            const option = availableSolicitudes?.data?.find((item) => item.value === value);
            setIsInterbibliotecaria((option as any)?.tipo === TipoPrestamo.INTERBIBLIOTECARIO.value);
        }),
        ...(!isInterbibliotecaria ? [
            { name: "modalidad", label: "Modalidad", options: ModalidadPrestamoLocal.toOptions() } as Field
        ] : []),
        {
            name: "fechaInicio",
            placeholder: "Seleccioná la fecha de inicio",
            label: "Fecha de inicio",
            type: "date",
            min: today,
            defaultValue: today,
            required: true,
            onChange: setStartDate
        },
        {
            name: "fechaVencimiento",
            placeholder: "Seleccioná la fecha de vencimiento",
            label: "Fecha de vencimiento",
            type: "date",
            min: startDate > today ? startDate : today
        }
    ];

    return useLibraryRecordsViewModel({
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
        create: {
            label: "Efectivizar préstamo",
            onOpen: onOpenCreate,
            submitDisabled: !solicitud.selected,
            fields: createFields,
            submit: handleCreatePrestamo
        },
        describe: describePrestamo
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
