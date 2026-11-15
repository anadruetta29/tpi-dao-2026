import { useEffect, useState } from "react";
import { type ActionState } from "@/core/types";
import { EstadoEnvio } from "@/domain/entities/estado-envio";
import { EstadoPrestamo, type Prestamo } from "@/domain/entities/prestamo";
import { EstadoReserva } from "@/domain/entities/estado-reserva";
import { EstadoSolicitud } from "@/domain/entities/estado-solicitud";
import { Rol } from "@/domain/entities/rol";
import { type Sede } from "@/domain/entities/sede";
import { type Session } from "@/domain/entities/session";
import { buscarPrestamosMostradorAction, type CriterioMostrador } from "@/ui/actions/mostrador/mostrador.actions";
import { getAllPrestamosAction } from "@/ui/actions/prestamo/prestamo.actions";
import { getAllRemitosAction } from "@/ui/actions/remito/remito.actions";
import { getAllReservasAction } from "@/ui/actions/reserva/reserva.actions";
import { getAllSedesAction } from "@/ui/actions/sede/sede.actions";
import { getAllSolicitudesPrestamoAction } from "@/ui/actions/solicitud-prestamo/solicitud-prestamo.actions";
import { localDateISO } from "@/ui/forms/handlers/local-date";
import { type ReadField } from "@/ui/forms/handlers/read-form";
import { pickData } from "@/ui/routes/use-library-records-viewmodel";

export type ModuloBandeja = "Solicitudes de préstamo" | "Remitos" | "Préstamos" | "Reservas";
export type DestinoBandeja = { modulo: ModuloBandeja; id: string };

type Pendiente = DestinoBandeja & { label: string; detalle: string; sedeId: string };
type Grupo = { titulo: string; items: ActionState<Pendiente[]> };
type Busqueda = { criterio: CriterioMostrador; valor: string; sedeId: string };

function fechaTexto(fecha?: string | Date | null) {
    return fecha instanceof Date ? fecha.toISOString().slice(0, 10) : fecha?.slice(0, 10) ?? "";
}

export async function getPendientes(session: Session, sedeId: string): Promise<Grupo[]> {
    const proximos = new Date();
    proximos.setDate(proximos.getDate() + 3);
    const hoy = localDateISO();
    const hasta = localDateISO(proximos);
    const getRemitos = async (estados: EstadoEnvio[], origen: boolean): Promise<ActionState<Pendiente[]>> => {
        const resultados = await Promise.all(estados.map((estado) => getAllRemitosAction({
            session, estado,
            ...(origen ? { sede_origen_id: sedeId } : { sede_destino_id: sedeId })
        })));
        const error = resultados.find(({ success }) => !success);
        if (error) return { success: false, error: error.error };
        return {
            success: true,
            data: resultados.flatMap(({ data }, indice) => (data?.remitos ?? []).map((remito) => ({
                modulo: "Remitos",
                id: remito.id,
                label: remito.numero,
                sedeId: origen ? remito.sedeOrigenId : remito.sedeDestinoId,
                detalle: remito.diasTransito == null ? estados[indice].name
                    : `${estados[indice].name} · ${remito.diasTransito} días en tránsito`
            })))
        };
    };

    const [solicitudes, despachos, recepciones, prestamos, reservas] = await Promise.all([
        getAllSolicitudesPrestamoAction({ session, estado: EstadoSolicitud.PENDIENTE, sedeId }),
        getRemitos([EstadoEnvio.ACEPTADO, EstadoEnvio.EMPACADO], true),
        getRemitos([EstadoEnvio.EN_TRANSITO, EstadoEnvio.DESPACHADO, EstadoEnvio.CON_INCIDENCIA], false),
        getAllPrestamosAction({ session, estado: EstadoPrestamo.ACTIVO, sede_id: sedeId }),
        getAllReservasAction({ session, estado: EstadoReserva.LISTA_PARA_RETIRO, sedeId })
    ]);

    return [
        {
            titulo: "Solicitudes por aprobar",
            items: pickData(solicitudes, (items) => items
                .filter(({ sedeOrigenId }) => !sedeId || sedeOrigenId === sedeId)
                .map((solicitud) => ({
                    modulo: "Solicitudes de préstamo", id: solicitud.id,
                    label: solicitud.numero, detalle: solicitud.tipoName, sedeId: solicitud.sedeOrigenId
                })))
        },
        { titulo: "Remitos para empacar o despachar", items: despachos },
        { titulo: "Remitos por recibir", items: recepciones },
        {
            titulo: "Préstamos que vencen en los próximos 3 días",
            items: pickData(prestamos, ({ prestamos: items }) => items
                .filter(({ fechaVencimiento }) => fechaTexto(fechaVencimiento) >= hoy && fechaTexto(fechaVencimiento) <= hasta)
                .sort((a, b) => fechaTexto(a.fechaVencimiento).localeCompare(fechaTexto(b.fechaVencimiento)))
                .map((prestamo) => ({
                    modulo: "Préstamos", id: prestamo.id,
                    sedeId: prestamo.sedeId,
                    label: `Préstamo #${prestamo.id}`, detalle: `Vence el ${fechaTexto(prestamo.fechaVencimiento)}`
                })))
        },
        {
            titulo: "Reservas listas para retirar",
            items: pickData(reservas, (items) => items
                .filter(({ fechaLimiteRetiro }) => !fechaLimiteRetiro || fechaTexto(fechaLimiteRetiro) >= hoy)
                .map((reserva) => ({
                    modulo: "Reservas", id: reserva.id, label: `Reserva #${reserva.id}`, sedeId: reserva.sedeId,
                    detalle: reserva.fechaLimiteRetiro
                        ? `Retiro hasta el ${fechaTexto(reserva.fechaLimiteRetiro)}` : reserva.estadoName
                })))
        }
    ];
}

export function useViewModel(session: Session) {
    const recepcionista = session.user?.roleEntity === Rol.RECEPCIONISTA;
    const [sedeSeleccionada, setSedeSeleccionada] = useState("");
    const [sedes, setSedes] = useState<ActionState<Sede[]> | null>(null);
    const [revision, setRevision] = useState(0);
    const [bandeja, setBandeja] = useState<{ sedeId: string; revision: number; grupos: Grupo[] } | null>(null);
    const [busqueda, setBusqueda] = useState<Busqueda | null>(null);
    const [resultado, setResultado] = useState<{ busqueda: Busqueda; prestamos: ActionState<Prestamo[]> } | null>(null);
    const sedeId = recepcionista ? session.user?.sedeId ?? "" : sedeSeleccionada;

    useEffect(() => {
        let active = true;
        void getAllSedesAction({ session }).then((result) => {
            if (active) setSedes(result);
        });
        return () => { active = false; };
    }, [session, revision]);

    useEffect(() => {
        if (recepcionista && !sedeId) return;
        let active = true;
        void getPendientes(session, sedeId).then((grupos) => {
            if (active) setBandeja({ sedeId, revision, grupos });
        });
        return () => { active = false; };
    }, [session, sedeId, recepcionista, revision]);

    useEffect(() => {
        if (!busqueda || busqueda.sedeId !== sedeId) return;
        let active = true;
        void buscarPrestamosMostradorAction(session, sedeId, busqueda.criterio, busqueda.valor).then((prestamos) => {
            if (active) setResultado({ busqueda, prestamos });
        });
        return () => { active = false; };
    }, [session, sedeId, busqueda]);

    const buscar = (field: ReadField) => {
        const criterio = field("criterio");
        if (criterio === "dni" || criterio === "codigo" || criterio === "prestamo") {
            setBusqueda({ criterio, valor: field("valor"), sedeId });
        }
    };

    const buscarEnSede = (id: string) => {
        setSedeSeleccionada(id);
        setBusqueda(null);
    };

    const sedeNombre = sedes?.data?.find(({ id }) => id === sedeId)?.nombre;
    return {
        sedeId,
        sedeNombre,
        sedes,
        recepcionista,
        buscar,
        buscarEnSede,
        refresh: () => setRevision((current) => current + 1),
        grupos: bandeja?.sedeId === sedeId && bandeja.revision === revision ? bandeja.grupos : null,
        buscando: Boolean(busqueda) && busqueda !== resultado?.busqueda,
        prestamos: busqueda && busqueda === resultado?.busqueda ? resultado.prestamos : null
    };
}
