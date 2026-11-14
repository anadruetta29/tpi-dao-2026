import { useCallback, useState } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoSolicitud, TipoPrestamo } from "@/domain/entities/solicitud-prestamo";
import { createSolicitudInterbibliotecariaAction, createSolicitudLocalAction, getAllSolicitudesPrestamoAction, getSolicitudPrestamoByIdAction, updateSolicitudEstadoAction } from "@/ui/actions/solicitud-prestamo/solicitud-prestamo.actions";
import { allOptions, info, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { readFields } from "@/ui/forms/handlers/record-fields";
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
    const esInterbibliotecaria = tipo === TipoPrestamo.INTERBIBLIOTECARIO;
    const load = useCallback(({ tipo, estado, sedeId }: { tipo: string; estado: string; sedeId: string }) => getAllSolicitudesPrestamoAction({
        session, sedeId,
        tipo: tipo ? TipoPrestamo.fromString(tipo) : undefined,
        estado: estado ? EstadoSolicitud.fromString(estado) : undefined
    }), [session]);
    const loadDetail = useCallback((id: string) => getSolicitudPrestamoByIdAction({ id, session }), [session]);

    return useLibraryRecordsViewModel({
        title: "Solicitudes de préstamo", initialFilters: { tipo: "", estado: "", sedeId: "" },
        load, loadDetail,
        filter: { label: "Filtrar", fields: [
            { name: "tipo", label: "Tipo", options: allOptions(TipoPrestamo.toOptions()) },
            { name: "estado", label: "Estado", options: allOptions(EstadoSolicitud.toOptions()) },
            selectors.sedeFilter
        ], submit: (field) => readFields(field, "tipo", "estado", "sedeId") },
        getLabel: (solicitud) => `${solicitud.numero} · ${solicitud.tipoName} · ${solicitud.estadoName}`,
        create: {
            label: "Registrar solicitud",
            submitDisabled: !selectors.canSubmit || (esInterbibliotecaria
                ? !selectors.hasDestination || !selectors.hasRecepcionista
                : !selectors.hasSocio),
            onOpen: () => {
                setTipo(TipoPrestamo.LOCAL);
                selectors.open();
            },
            fields: [
                { name: "tipo", label: "Tipo de solicitud", defaultValue: tipo.value, options: TipoPrestamo.toOptions(),
                    onChange: (value) => setTipo(TipoPrestamo.fromString(value)) },
                esInterbibliotecaria ? selectors.recepcionistaField : selectors.socioField,
                ...selectors.fields,
                ...(esInterbibliotecaria ? [selectors.destinationField] : [])
            ],
            submit: (field) => {
                const command = { session, ...readFields(field, "ejemplarId", "sedeOrigenId") };
                return esInterbibliotecaria
                    ? createSolicitudInterbibliotecariaAction({ ...command, ...readFields(field, "recepcionistaId", "sedeDestinoId") })
                    : createSolicitudLocalAction({ ...command, socioId: field("socioId") });
            }
        },
        describe: (solicitud) => {
            const options = nextStates(solicitud.estadoEntity).map((estado) => estado.toOption());
            return {
                info: [info("Número", solicitud.numero), info("Tipo", solicitud.tipoName), info("Estado", solicitud.estadoName),
                    ...(solicitud.socioId ? [info("Socio", selectors.socios.get(solicitud.socioId) ?? solicitud.socioId)] : []),
                    info("Ejemplar", selectors.copyNames.get(solicitud.ejemplarId) ?? solicitud.ejemplarId),
                    info("Sede de origen", selectors.sedeNames.get(solicitud.sedeOrigenId) ?? solicitud.sedeOrigenId),
                    info("Sede de destino", selectors.sedeNames.get(solicitud.sedeDestinoId) ?? solicitud.sedeDestinoId),
                    info(solicitud.tipo === TipoPrestamo.INTERBIBLIOTECARIO && !solicitud.socioId ? "Recepcionista" : "Responsable de origen",
                        selectors.recepcionistas.get(solicitud.responsableOrigenId) ?? solicitud.responsableOrigenId),
                    info("Responsable de destino", solicitud.responsableDestinoId)],
                forms: options.length ? [{
                    label: "Actualizar estado", fields: [{ name: "estado", label: "Nuevo estado", options }],
                    submit: (field) => updateSolicitudEstadoAction({ session, id: solicitud.id, estado: EstadoSolicitud.fromString(field("estado")) })
                }] : []
            };
        }
    });
}
