import React, { useCallback, useState } from "react";
import { type Session } from "@/domain/entities/session";
import { LibraryField } from "@/ui/components/library-field/library-field";
import { LibraryForm } from "@/ui/components/library-form/library-form";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { EstadoReserva } from "@/domain/entities/reserva";
import {
    createReservaAction,
    getAllReservasAction,
    getReservaByIdAction,
    updateReservaEstadoAction
} from "@/ui/actions/reserva/reserva.actions";

interface ReservaSectionProps {
    session: Session;
}

export const ReservaSection: React.FC<ReservaSectionProps> = ({ session }) => {
    const [filters, setFilters] = useState({ libroId: "", socioId: "", sedeId: "", estado: "" });
    const load = useCallback(() => getAllReservasAction({
        session,
        ...filters,
        estado: filters.estado ? EstadoReserva.fromString(filters.estado) : undefined
    }), [session, filters]);
    const loadDetail = useCallback((id: string) => getReservaByIdAction({ session, id }), [session]);

    return (
        <LibraryRecords
            title="Reservas"
            createLabel="Registrar reserva"
            load={load}
            loadDetail={loadDetail}
            getLabel={(reserva) => `Reserva ${reserva.id} · ${reserva.estadoName}`}
            filters={(
                <LibraryForm label="Filtrar" onSubmit={(field) => setFilters({
                    libroId: field("libroId"),
                    socioId: field("socioId"),
                    sedeId: field("sedeId"),
                    estado: field("estado")
                })}>
                    <LibraryField name="libroId" label="ID de libro" />
                    <LibraryField name="socioId" label="ID de socio" />
                    <LibraryField name="sedeId" label="ID de sede" />
                    <LibraryField name="estado" label="Estado" options={[{ value: "", label: "Todos" }, ...EstadoReserva.toOptions()]} />
                </LibraryForm>
            )}
            renderCreate={({ isSaving, save }) => (
                <LibraryForm label="Registrar reserva" isSaving={isSaving} onSubmit={(field) => {
                    const libroId = field("libroId");
                    const ejemplarId = field("ejemplarId");
                    void save(() => {
                        if (!libroId && !ejemplarId) {
                            return Promise.resolve({ success: false, error: "Completá el ID del libro o del ejemplar." });
                        }
                        return createReservaAction({
                            session,
                            socioId: field("socioId"),
                            libroId: libroId || undefined,
                            ejemplarId: ejemplarId || undefined,
                            sedeId: field("sedeId") || undefined,
                            fecha: field("fecha") || undefined
                        });
                    });
                }}>
                    <LibraryField name="socioId" label="ID de socio" required />
                    <LibraryField name="libroId" label="ID de libro" />
                    <LibraryField name="ejemplarId" label="ID de ejemplar" />
                    <LibraryField name="sedeId" label="ID de sede" />
                    <LibraryField name="fecha" label="Fecha" type="date" />
                </LibraryForm>
            )}
            renderDetail={(reserva, { isSaving, save }) => (
                <>
                    <div><strong>Fecha:</strong> {String(reserva.fecha ?? "—")}</div>
                    <div><strong>Estado:</strong> {reserva.estadoName}</div>
                    <div><strong>Socio:</strong> {reserva.socioId || "—"}</div>
                    <div><strong>Libro:</strong> {reserva.libroId || "—"}</div>
                    <div><strong>Ejemplar:</strong> {reserva.ejemplarId || "—"}</div>
                    <div><strong>Sede:</strong> {reserva.sedeId || "—"}</div>
                    <LibraryForm label="Actualizar estado" isSaving={isSaving} onSubmit={(field) => {
                        const estado = EstadoReserva.fromString(field("estado"));
                        if (estado !== reserva.estadoEntity) void save(() => updateReservaEstadoAction({ session, id: reserva.id, estado }));
                    }}>
                        <LibraryField name="estado" label="Nuevo estado" defaultValue={reserva.estado.value} options={EstadoReserva.toOptions()} />
                    </LibraryForm>
                </>
            )}
        />
    );
};
