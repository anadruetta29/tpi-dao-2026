import { useCallback, useState } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoSolicitud, TipoPrestamo, type SolicitudPrestamo } from "@/domain/entities/solicitud-prestamo";
import {
    createSolicitudInterbibliotecariaAction,
    createSolicitudLocalAction,
    getAllSolicitudesPrestamoAction,
    getSolicitudPrestamoByIdAction,
    updateSolicitudEstadoAction
} from "@/ui/actions/solicitud-prestamo/solicitud-prestamo.actions";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { allOptions, info, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";
import { useSelectoresViewModel } from "./selectores-viewmodel";

function nextStates(estado: EstadoSolicitud) {
    if (estado === EstadoSolicitud.PENDIENTE) {
        return [EstadoSolicitud.APROBADA, EstadoSolicitud.RECHAZADA, EstadoSolicitud.CANCELADA];
    }
    return estado === EstadoSolicitud.APROBADA ? [EstadoSolicitud.CANCELADA] : [];
}

export function useViewModel(session: Session) {
    const [tipo, setTipo] = useState(TipoPrestamo.LOCAL);
    const selectors = useSelectoresViewModel(session);

    {/* ===== Fetch data ===== */ }

    const fetchSolicitudes = useCallback(({ tipo: filterTipo, estado, sedeId }: { tipo: string; estado: string; sedeId: string }) => {
        return getAllSolicitudesPrestamoAction({
            session,
            sedeId,
            tipo: filterTipo ? TipoPrestamo.fromString(filterTipo) : undefined,
            estado: estado ? EstadoSolicitud.fromString(estado) : undefined
        });
    }, [session]);

    const fetchSolicitudDetail = useCallback((id: string) => {
        return getSolicitudPrestamoByIdAction({ id, session });
    }, [session]);

    {/* ===== onActions functions ===== */ }

    const onOpenCreate = () => {
        setTipo(TipoPrestamo.LOCAL);
        selectors.open();
    };

    const onTipoChange = (value: string) => {
        setTipo(TipoPrestamo.fromString(value));
    };

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "tipo", "estado", "sedeId");
    };

    const handleCreateSolicitud = (field: ReadField) => {
        const command = { session, ...readFields(field, "ejemplarId", "sedeOrigenId") };
        return esInterbibliotecaria
            ? createSolicitudInterbibliotecariaAction({
                ...command,
                sedeDestinoId: field("sedeDestinoId"),
                recepcionistaId: session.user?.id ?? ""
            })
            : createSolicitudLocalAction({ ...command, socioId: field("socioId") });
    };

    const handleUpdateEstado = (solicitudId: string, field: ReadField) => {
        return updateSolicitudEstadoAction({
            session,
            id: solicitudId,
            estado: EstadoSolicitud.fromString(field("estado"))
        });
    };

    const describeSolicitud = (solicitud: SolicitudPrestamo) => {
        const options = nextStates(solicitud.estadoEntity).map((estado) => estado.toOption());
        return {
            info: [
                info("Número", solicitud.numero),
                info("Tipo", solicitud.tipoName),
                info("Estado", solicitud.estadoName),
                ...(solicitud.socioId ? [info("Socio", selectors.socios.get(solicitud.socioId) ?? solicitud.socioId)] : []),
                info("Ejemplar", selectors.copyNames.get(solicitud.ejemplarId) ?? solicitud.ejemplarId),
                info("Sede de origen", selectors.sedeNames.get(solicitud.sedeOrigenId) ?? solicitud.sedeOrigenId),
                info("Sede de destino", selectors.sedeNames.get(solicitud.sedeDestinoId) ?? solicitud.sedeDestinoId),
                info(
                    solicitud.tipo === TipoPrestamo.INTERBIBLIOTECARIO && !solicitud.socioId ? "Recepcionista" : "Responsable de origen",
                    selectors.recepcionistas.get(solicitud.responsableOrigenId) ?? solicitud.responsableOrigenId
                ),
                info("Responsable de destino", solicitud.responsableDestinoId)
            ],
            forms: options.length ? [{
                label: "Actualizar estado",
                fields: [{ name: "estado", label: "Nuevo estado", options }],
                submit: (field: ReadField) => handleUpdateEstado(solicitud.id, field)
            }] : []
        };
    };

    {/* ===== variables ===== */ }

    const esInterbibliotecaria = tipo === TipoPrestamo.INTERBIBLIOTECARIO;

    const getSolicitudLabel = (solicitud: SolicitudPrestamo) => {
        return `${solicitud.numero} · ${solicitud.tipoName} · ${solicitud.estadoName}`;
    };

    const filterFields: Field[] = [
        { name: "tipo", label: "Tipo", options: allOptions(TipoPrestamo.toOptions()) },
        { name: "estado", label: "Estado", options: allOptions(EstadoSolicitud.toOptions()) },
        selectors.sedeFilter
    ];

    const submitDisabled = !selectors.canSubmit || (esInterbibliotecaria
        ? !selectors.hasDestination || !session.user?.id
        : !selectors.hasSocio);

    const createFields: Field[] = [
        {
            name: "tipo",
            label: "Tipo de solicitud",
            defaultValue: tipo.value,
            options: TipoPrestamo.toOptions(),
            onChange: onTipoChange
        },
        ...(esInterbibliotecaria ? [] : [selectors.socioField]),
        ...selectors.fields,
        ...(esInterbibliotecaria ? [selectors.destinationField] : [])
    ];

    return useLibraryRecordsViewModel({
        title: "Solicitudes de préstamo",
        initialFilters: { tipo: "", estado: "", sedeId: "" },
        load: fetchSolicitudes,
        loadDetail: fetchSolicitudDetail,
        filter: {
            label: "Filtrar",
            fields: filterFields,
            submit: handleFilterSubmit
        },
        getLabel: getSolicitudLabel,
        create: {
            label: "Registrar solicitud",
            submitDisabled,
            onOpen: onOpenCreate,
            fields: createFields,
            submit: handleCreateSolicitud
        },
        describe: describeSolicitud
    });
}

export default useViewModel;
export { useViewModel as ViewModel };
