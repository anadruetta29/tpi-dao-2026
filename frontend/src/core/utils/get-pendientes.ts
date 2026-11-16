import { type ActionState } from "@/core/types";
import { type Session } from "@/domain/entities/session";
import { EstadoPrestamo, ModalidadPrestamoLocal } from "@/domain/entities/prestamo";
import { EstadoReserva } from "@/domain/entities/estado-reserva";
import { EstadoSolicitud, TipoPrestamo } from "@/domain/entities/solicitud-prestamo";
import { getAllPrestamosAction, renovarPrestamoAction } from "@/ui/actions/prestamo/prestamo.actions";
import { getAllRemitosAction, registrarDespachoRemitoAction, registrarEmpaqueRemitoAction, registrarRecepcionRemitoAction } from "@/ui/actions/remito/remito.actions"; 
import { pickData } from "@/ui/routes/use-library-records-viewmodel";
import { type Grupo, type Pendiente } from "../types";
import { fechaTexto } from "./fecha-a-texto";
import { localDateISO } from "@/ui/forms/handlers/local-date";
import { EstadoEnvio } from "@/domain/entities/estado-envio";
import { getAllSolicitudesPrestamoAction, updateSolicitudEstadoAction } from "@/ui/actions/solicitud-prestamo/solicitud-prestamo.actions";
import { getAllReservasAction, updateReservaEstadoAction } from "@/ui/actions/reserva/reserva.actions";


export async function getPendientes(
    session: Session,
    sedeId: string
): Promise<Grupo[]> {
    const proximos = new Date();
    proximos.setDate(proximos.getDate() + 3);

    const hoy = localDateISO();
    const hasta = localDateISO(proximos);

    const getRemitos = async (
        estados: EstadoEnvio[],
        origen: boolean
    ): Promise<ActionState<Pendiente[]>> => {
        const resultados = await Promise.all(
            estados.map((estado) =>
                getAllRemitosAction({
                    session,
                    estado,
                    ...(origen
                        ? { sede_origen_id: sedeId }
                        : { sede_destino_id: sedeId })
                })
            )
        );

        const error = resultados.find(({ success }) => !success);

        if (error) {
            return { success: false, error: error.error };
        }

        return {
            success: true,
            data: resultados.flatMap(({ data }, indice) =>
                (data?.remitos ?? []).map((remito) => {
                    const estadoActual = estados[indice];
                    let accion: Pendiente["accion"];

                    if (origen && estadoActual === EstadoEnvio.ACEPTADO) {
                        accion = {
                            label: "Empacar",
                            tone: "primary",
                            execute: () => registrarEmpaqueRemitoAction(remito.id, session)
                        };
                    } else if (origen && estadoActual === EstadoEnvio.EMPACADO) {
                        accion = {
                            label: "Despachar",
                            tone: "primary",
                            execute: () => registrarDespachoRemitoAction({
                                session,
                                id: remito.id,
                                fechaDespacho: hoy
                            })
                        };
                    } else if (
                        !origen &&
                        (estadoActual === EstadoEnvio.DESPACHADO ||
                            estadoActual === EstadoEnvio.EN_TRANSITO)
                    ) {
                        accion = {
                            label: "Recibir OK",
                            tone: "primary",
                            execute: () => registrarRecepcionRemitoAction({
                                session,
                                id: remito.id,
                                fechaRecepcion: hoy,
                                conIncidencia: false
                            })
                        };
                    }

                    return {
                        modulo: "Remitos" as const,
                        id: remito.id,
                        label: remito.numero,
                        sedeId: origen ? remito.sedeOrigenId : remito.sedeDestinoId,
                        detalle: remito.diasTransito == null
                            ? estadoActual.name
                            : `${estadoActual.name} · ${remito.diasTransito} días en tránsito`,
                        accion
                    };
                })
            )
        };
    };

    const [
        solicitudes,
        despachos,
        recepciones,
        prestamos,
        reservas
    ] = await Promise.all([
        getAllSolicitudesPrestamoAction({
            session,
            estado: EstadoSolicitud.PENDIENTE,
            sedeId
        }),
        getRemitos([EstadoEnvio.ACEPTADO, EstadoEnvio.EMPACADO], true),
        getRemitos([
            EstadoEnvio.EN_TRANSITO,
            EstadoEnvio.DESPACHADO,
            EstadoEnvio.CON_INCIDENCIA
        ], false),
        getAllPrestamosAction({
            session,
            estado: EstadoPrestamo.ACTIVO,
            sede_id: sedeId
        }),
        getAllReservasAction({
            session,
            estado: EstadoReserva.LISTA_PARA_RETIRO,
            sedeId
        })
    ]);

    return [
        {
            titulo: "Solicitudes por aprobar",
            items: pickData(solicitudes, (items) =>
                items
                    .filter(({ sedeOrigenId }) =>
                        !sedeId || sedeOrigenId === sedeId
                    )
                    .map((solicitud) => ({
                        modulo: "Solicitudes de préstamo" as const,
                        id: solicitud.id,
                        label: solicitud.numero,
                        detalle: solicitud.tipoName,
                        sedeId: solicitud.sedeOrigenId,
                        accion: {
                            label: solicitud.tipo === TipoPrestamo.LOCAL
                                ? "Aprobar (Domicilio)"
                                : "Aprobar",
                            tone: "primary" as const,
                            execute: () => updateSolicitudEstadoAction({
                                session,
                                id: solicitud.id,
                                estado: EstadoSolicitud.APROBADA,
                                ...(solicitud.tipo === TipoPrestamo.LOCAL
                                    ? { modalidad: ModalidadPrestamoLocal.DOMICILIO }
                                    : {})
                            })
                        }
                    }))
            )
        },
        {
            titulo: "Remitos para empacar o despachar",
            items: despachos
        },
        {
            titulo: "Remitos por recibir",
            items: recepciones
        },
        {
            titulo: "Préstamos que vencen en los próximos 3 días",
            items: pickData(prestamos, ({ prestamos: items }) =>
                items
                    .filter(({ fechaVencimiento }) =>
                        fechaTexto(fechaVencimiento) >= hoy &&
                        fechaTexto(fechaVencimiento) <= hasta
                    )
                    .sort((a, b) =>
                        fechaTexto(a.fechaVencimiento)
                            .localeCompare(fechaTexto(b.fechaVencimiento))
                    )
                    .map((prestamo) => ({
                        modulo: "Préstamos" as const,
                        id: prestamo.id,
                        sedeId: prestamo.sedeId,
                        label: `Préstamo #${prestamo.id}`,
                        detalle: `Vence el ${fechaTexto(prestamo.fechaVencimiento)}`,
                        accion: prestamo.modalidadEntity === ModalidadPrestamoLocal.DOMICILIO
                            ? {
                                label: "Renovar",
                                execute: () => renovarPrestamoAction({
                                    id: prestamo.id,
                                    session
                                })
                            }
                            : undefined
                    }))
            )
        },
        {
            titulo: "Reservas listas para retirar",
            items: pickData(reservas, (items) =>
                items
                    .filter(({ fechaLimiteRetiro }) =>
                        !fechaLimiteRetiro || fechaTexto(fechaLimiteRetiro) >= hoy
                    )
                    .map((reserva) => ({
                        modulo: "Reservas" as const,
                        id: reserva.id,
                        label: `Reserva #${reserva.id}`,
                        sedeId: reserva.sedeId,
                        detalle: reserva.fechaLimiteRetiro
                            ? `Retiro hasta el ${fechaTexto(reserva.fechaLimiteRetiro)}`
                            : reserva.estadoName,
                        accion: {
                            label: "Entregar",
                            tone: "primary" as const,
                            execute: () => updateReservaEstadoAction({
                                session,
                                id: reserva.id,
                                estado: EstadoReserva.RETIRADA
                            })
                        }
                    }))
            )
        }
    ];
}