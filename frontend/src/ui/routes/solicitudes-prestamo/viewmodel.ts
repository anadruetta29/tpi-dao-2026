import { useCallback, useState } from "react";
import { type Session } from "@/domain/entities/session";
import { EstadoSolicitud, TipoPrestamo } from "@/domain/entities/solicitud-prestamo";
import { createSolicitudInterbibliotecariaAction, createSolicitudLocalAction, getAllSolicitudesPrestamoAction, getSolicitudPrestamoByIdAction, updateSolicitudEstadoAction } from "@/ui/actions/solicitud-prestamo/solicitud-prestamo.actions";
import { allOptions, info, useLibraryRecordsViewModel } from "@/ui/routes/use-library-records-viewmodel";
import { idField, readFields } from "@/ui/forms/handlers/record-fields";

function nextStates(estado: EstadoSolicitud) {
    if (estado === EstadoSolicitud.PENDIENTE) {
        return [EstadoSolicitud.APROBADA, EstadoSolicitud.RECHAZADA, EstadoSolicitud.CANCELADA];
    }
    return estado === EstadoSolicitud.APROBADA ? [EstadoSolicitud.CANCELADA] : [];
}

export function useViewModel(session: Session) {
    const [tipo, setTipo] = useState(TipoPrestamo.LOCAL);
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
            idField("sedeId", "ID de sede")
        ], submit: (field) => readFields(field, "tipo", "estado", "sedeId") },
        getLabel: (solicitud) => `${solicitud.numero} · ${solicitud.tipoName} · ${solicitud.estadoName}`,
        create: {
            label: "Registrar solicitud",
            fields: [
                { name: "tipo", label: "Tipo de solicitud", defaultValue: tipo.value, options: TipoPrestamo.toOptions(),
                    onChange: (value) => setTipo(TipoPrestamo.fromString(value)) },
                idField("socioId", "ID de socio", true), idField("ejemplarId", "ID de ejemplar", true),
                idField("sedeOrigenId", "ID de sede de origen", true),
                ...(tipo === TipoPrestamo.INTERBIBLIOTECARIO ? [idField("sedeDestinoId", "ID de sede de destino", true)] : [])
            ],
            submit: (field) => {
                const command = { session, ...readFields(field, "socioId", "ejemplarId", "sedeOrigenId") };
                return tipo === TipoPrestamo.LOCAL
                    ? createSolicitudLocalAction(command)
                    : createSolicitudInterbibliotecariaAction({ ...command, sedeDestinoId: field("sedeDestinoId") });
            }
        },
        describe: (solicitud) => {
            const options = nextStates(solicitud.estadoEntity).map((estado) => estado.toOption());
            return {
                info: [info("Número", solicitud.numero), info("Tipo", solicitud.tipoName), info("Estado", solicitud.estadoName),
                    info("Socio", solicitud.socioId), info("Ejemplar", solicitud.ejemplarId), info("Sede de origen", solicitud.sedeOrigenId),
                    info("Sede de destino", solicitud.sedeDestinoId), info("Responsable de origen", solicitud.responsableOrigenId),
                    info("Responsable de destino", solicitud.responsableDestinoId)],
                forms: options.length ? [{
                    label: "Actualizar estado", fields: [{ name: "estado", label: "Nuevo estado", options }],
                    submit: (field) => updateSolicitudEstadoAction({ session, id: solicitud.id, estado: EstadoSolicitud.fromString(field("estado")) })
                }] : []
            };
        }
    });
}
