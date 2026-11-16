import { useCallback, useState } from "react";
import { type Session } from "@/domain/entities/session";
import { ModalidadPrestamoLocal } from "@/domain/entities/modalidad-prestamo-local";
import { Rol } from "@/domain/entities/rol";
import { localDateISO, localDatePlusDaysISO } from "@/ui/forms/handlers/local-date";
import { EstadoSolicitud, TipoPrestamo, type SolicitudPrestamo } from "@/domain/entities/solicitud-prestamo";
import { createSolicitudInterbibliotecariaAction, createSolicitudLocalAction, getAllSolicitudesPrestamoAction, 
    getSolicitudPrestamoByIdAction, updateSolicitudEstadoAction } from "@/ui/actions/solicitud-prestamo/solicitud-prestamo.actions";
import { readFields } from "@/ui/forms/handlers/record-fields";
import { type ReadField, type ReadFieldValues } from "@/ui/forms/handlers/read-form";
import { allOptions, info, statusInfo, useLibraryRecordsViewModel, type Field } from "@/ui/routes/use-library-records-viewmodel";
import { useSelectoresViewModel } from "./selectores-viewmodel";
import type { SolicitudInterbibliotecariaInicial } from "@/core/types";


export default function ViewModel(
    session: Session,
    initialRecordId?: string,
    solicitudInicial?: SolicitudInterbibliotecariaInicial
) {
    const nextStates = [EstadoSolicitud.RECHAZADA, EstadoSolicitud.CANCELADA].map((estado) => estado.toOption());

    const [tipo, setTipo] = useState(solicitudInicial ? TipoPrestamo.INTERBIBLIOTECARIO : TipoPrestamo.LOCAL);
    const [modalidadAprobacion, setModalidadAprobacion] = useState(ModalidadPrestamoLocal.DOMICILIO);
    const esInterbibliotecaria = tipo === TipoPrestamo.INTERBIBLIOTECARIO;
    const selectors = useSelectoresViewModel(session, esInterbibliotecaria, solicitudInicial);
    const isRecepcionista = session.user?.role === Rol.RECEPCIONISTA;

    {/* ===== Fetch data ===== */ }

    const fetchSolicitudes = useCallback(({ tipo: filterTipo, estado, sedeId }: { tipo: string; estado: string; sedeId: string }) => {
        return getAllSolicitudesPrestamoAction({
            session,
            sedeId: isRecepcionista ? session.user?.sedeId : sedeId,
            tipo: filterTipo ? TipoPrestamo.fromString(filterTipo) : undefined,
            estado: estado ? EstadoSolicitud.fromString(estado) : undefined
        });
    }, [session, isRecepcionista]);

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
        selectors.reset();
    };

    {/* ===== handlers functions ===== */ }

    const handleFilterSubmit = (field: ReadField) => {
        return readFields(field, "tipo", "estado", "sedeId");
    };

    const handleCreateSolicitud = (field: ReadField, values: ReadFieldValues) => {
        const command = { session, sedeOrigenId: field("sedeOrigenId"), ejemplaresIds: values("ejemplaresIds") };
        return esInterbibliotecaria
            ? createSolicitudInterbibliotecariaAction({
                ...command,
                sedeDestinoId: field("sedeDestinoId")

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

    const handleAprobar = (solicitud: SolicitudPrestamo, field: ReadField) => {
        const local = solicitud.tipo === TipoPrestamo.LOCAL;
        return updateSolicitudEstadoAction({
            session,
            id: solicitud.id,
            estado: EstadoSolicitud.APROBADA,
            modalidad: local ? ModalidadPrestamoLocal.fromString(field("modalidad")) : undefined,
            fechaVencimiento: local ? (ModalidadPrestamoLocal.fromString(field("modalidad")) === ModalidadPrestamoLocal.SALA_LECTURA ? localDateISO() : (field("fechaVencimiento") || undefined)) : undefined
        });
    };

    const describeSolicitud = (solicitud: SolicitudPrestamo) => {
        const pendiente = solicitud.estadoEntity === EstadoSolicitud.PENDIENTE;
        const local = solicitud.tipo === TipoPrestamo.LOCAL;
        const aprobacionPendiente = solicitud.estadoEntity === EstadoSolicitud.APROBADA
            && solicitud.aprobacionCompleta === false;
        const puedeAprobar = (pendiente || aprobacionPendiente) && (session.user?.roleEntity !== Rol.RECEPCIONISTA
            || session.user.sedeId === solicitud.sedeOrigenId
            || (aprobacionPendiente && !local && session.user.sedeId === solicitud.sedeDestinoId));
        const camposAprobacion: Field[] = local ? [
            { name: "modalidad", label: "Modalidad", defaultValue: modalidadAprobacion.value, options: ModalidadPrestamoLocal.toOptions(), onChange: (value) => setModalidadAprobacion(ModalidadPrestamoLocal.fromString(value)) },
            modalidadAprobacion === ModalidadPrestamoLocal.SALA_LECTURA ? { name: "fechaVencimiento", placeholder: "Vence hoy", label: "Fecha de vencimiento", type: "date", defaultValue: localDateISO(), min: localDateISO(), max: localDateISO(), disabled: true } : { name: "fechaVencimiento", placeholder: "Seleccioná la fecha de vencimiento", label: "Fecha de vencimiento", type: "date", defaultValue: localDatePlusDaysISO(7), min: localDateISO() }
        ] : [];
        return {
            info: [
                info("Número", solicitud.numero),
                info("Tipo", solicitud.tipoName),
                statusInfo(solicitud.estadoName),
                ...(solicitud.aprobacionCompleta === false
                    ? [statusInfo("Falta aprobación", "attention", "Aprobación")]
                    : []),
                ...(solicitud.socioId ? [info("Socio", selectors.socios.get(solicitud.socioId) ?? solicitud.socioId)] : []),
                info("Ejemplares", solicitud.ejemplaresIds.map((id) => selectors.copyNames.get(id) ?? `#${id}`).join(", ")),
                info("Sede de origen", selectors.sedeNames.get(solicitud.sedeOrigenId) ?? solicitud.sedeOrigenId),
                info("Sede de destino", selectors.sedeNames.get(solicitud.sedeDestinoId) ?? solicitud.sedeDestinoId),
                info(
                    solicitud.tipo === TipoPrestamo.INTERBIBLIOTECARIO && !solicitud.socioId ? "Recepcionista" : "Responsable de origen",
                    selectors.recepcionistas.get(solicitud.responsableOrigenId) ?? solicitud.responsableOrigenId
                ),
                info("Responsable de destino", solicitud.responsableDestinoId)
            ],
            forms: [
                ...(puedeAprobar ? [{
                    label: aprobacionPendiente ? "Completar aprobación" : "Aprobar solicitud",
                    fields: camposAprobacion,
                    submit: (field: ReadField) => handleAprobar(solicitud, field)
                }] : []),
                ...(pendiente ? [{
                    label: "Actualizar estado",
                    fields: [{ name: "estado", label: "Nuevo estado", options: nextStates }],
                    submit: (field: ReadField) => handleUpdateEstado(solicitud.id, field)
                }] : [])
            ]
        };
    };

    {/* ===== variables ===== */ }

    const getSolicitudLabel = (solicitud: SolicitudPrestamo) => {
        const destinatario = solicitud.socioId
            ? (selectors.socios.get(solicitud.socioId) ?? `Socio #${solicitud.socioId}`)
            : `${selectors.sedeNames.get(solicitud.sedeOrigenId) ?? `Sede #${solicitud.sedeOrigenId}`} → ${selectors.sedeNames.get(solicitud.sedeDestinoId) ?? `Sede #${solicitud.sedeDestinoId}`}`;
        return `${solicitud.numero} · ${destinatario}`;
    };

    const getSolicitudMeta = (solicitud: SolicitudPrestamo) => {
        const copias = Array.from(new Set(solicitud.ejemplaresIds.map((id) => selectors.copyTitles.get(id) || selectors.copyNames.get(id) || `#${id}`).filter(Boolean))).join(", ");
        return [solicitud.tipoName, copias || undefined].filter(Boolean).join(" · ");
    };

    const filterFields: Field[] = [
        { name: "tipo", label: "Tipo", options: allOptions(TipoPrestamo.toOptions()) },
        { name: "estado", label: "Estado", options: allOptions(EstadoSolicitud.toOptions()) },
        ...(isRecepcionista ? [] : [selectors.sedeFilter])
    ];

    const submitDisabled = !selectors.canSubmit || (esInterbibliotecaria
        ? !selectors.hasDestination
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
        ...selectors.fields

    ];

    return useLibraryRecordsViewModel({
        initialRecordId,
        newestFirst: true,
        initiallyOpen: Boolean(solicitudInicial),
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
        getMeta: getSolicitudMeta,
        getStatuses: (solicitud) => [solicitud.estadoName, solicitud.aprobacionCompleta === false ? "Falta aprobación" : ""],
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
