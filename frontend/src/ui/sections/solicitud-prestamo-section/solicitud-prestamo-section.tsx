import React, { useCallback, useState } from "react";
import { type Session } from "@/domain/entities/session";
import { LibraryField } from "@/ui/components/library-field/library-field";
import { LibraryForm } from "@/ui/components/library-form/library-form";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { EstadoSolicitud, TipoPrestamo } from "@/domain/entities/solicitud-prestamo";
import {
    createSolicitudInterbibliotecariaAction,
    createSolicitudLocalAction,
    getAllSolicitudesPrestamoAction,
    getSolicitudPrestamoByIdAction,
    updateSolicitudEstadoAction
} from "@/ui/actions/solicitud-prestamo/solicitud-prestamo.actions";

interface SolicitudPrestamoSectionProps {
    session: Session;
}

export const SolicitudPrestamoSection: React.FC<SolicitudPrestamoSectionProps> = ({ session }) => {
    const [filters, setFilters] = useState({ tipo: "", estado: "", sedeId: "" });
    const [tipo, setTipo] = useState(TipoPrestamo.LOCAL);
    const load = useCallback(() => getAllSolicitudesPrestamoAction({
        session,
        tipo: filters.tipo ? TipoPrestamo.fromString(filters.tipo) : undefined,
        estado: filters.estado ? EstadoSolicitud.fromString(filters.estado) : undefined,
        sedeId: filters.sedeId
    }), [session, filters]);
    const loadDetail = useCallback((id: string) => getSolicitudPrestamoByIdAction({ session, id }), [session]);

    return (
        <LibraryRecords
            title="Solicitudes de préstamo"
            createLabel="Registrar solicitud"
            load={load}
            loadDetail={loadDetail}
            getLabel={(solicitud) => `Solicitud ${solicitud.numero || solicitud.id} · ${solicitud.tipoName} · ${solicitud.estadoName}`}
            filters={(
                <LibraryForm label="Filtrar" onSubmit={(field) => setFilters({ tipo: field("tipo"), estado: field("estado"), sedeId: field("sedeId") })}>
                    <LibraryField name="tipo" label="Tipo" options={[{ value: "", label: "Todos" }, ...TipoPrestamo.toOptions()]} />
                    <LibraryField name="estado" label="Estado" options={[{ value: "", label: "Todos" }, ...EstadoSolicitud.toOptions()]} />
                    <LibraryField name="sedeId" label="ID de sede" />
                </LibraryForm>
            )}
            renderCreate={({ isSaving, save }) => (
                <LibraryForm label={`Registrar solicitud ${tipo.name.toLowerCase()}`} isSaving={isSaving} onSubmit={(field) => {
                    const command = { session, socioId: field("socioId"), ejemplarId: field("ejemplarId"), sedeOrigenId: field("sedeOrigenId") };
                    void save(() => tipo === TipoPrestamo.LOCAL
                        ? createSolicitudLocalAction(command)
                        : createSolicitudInterbibliotecariaAction({ ...command, sedeDestinoId: field("sedeDestinoId") }));
                }}>
                    <LibraryField name="tipo" label="Tipo de solicitud" defaultValue={tipo.value} options={TipoPrestamo.toOptions()} onChange={(value) => setTipo(TipoPrestamo.fromString(value))} />
                    <LibraryField name="socioId" label="ID de socio" required />
                    <LibraryField name="ejemplarId" label="ID de ejemplar" required />
                    <LibraryField name="sedeOrigenId" label="ID de sede de origen" required />
                    {tipo === TipoPrestamo.INTERBIBLIOTECARIO && <LibraryField name="sedeDestinoId" label="ID de sede de destino" required />}
                </LibraryForm>
            )}
            renderDetail={(solicitud, { isSaving, save }) => (
                <>
                    <div><strong>Tipo:</strong> {solicitud.tipoName}</div>
                    <div><strong>Estado:</strong> {solicitud.estadoName}</div>
                    <div><strong>Socio:</strong> {solicitud.socioId || "—"}</div>
                    <div><strong>Ejemplar:</strong> {solicitud.ejemplarId || "—"}</div>
                    <div><strong>Sede de origen:</strong> {solicitud.sedeOrigenId || "—"}</div>
                    <div><strong>Sede de destino:</strong> {solicitud.sedeDestinoId || "—"}</div>
                    <div><strong>Responsable de origen:</strong> {solicitud.responsableOrigenId || "—"}</div>
                    <div><strong>Responsable de destino:</strong> {solicitud.responsableDestinoId || "—"}</div>
                    <LibraryForm label="Actualizar estado" isSaving={isSaving} onSubmit={(field) => {
                        const estado = EstadoSolicitud.fromString(field("estado"));
                        if (estado !== solicitud.estadoEntity) void save(() => updateSolicitudEstadoAction({ session, id: solicitud.id, estado }));
                    }}>
                        <LibraryField name="estado" label="Nuevo estado" defaultValue={solicitud.estado.value} options={EstadoSolicitud.toOptions()} />
                    </LibraryForm>
                </>
            )}
        />
    );
};
