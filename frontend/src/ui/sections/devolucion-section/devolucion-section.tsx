import React, { useCallback } from "react";
import { type Session } from "@/domain/entities/session";
import { LibraryField } from "@/ui/components/library-field/library-field";
import { LibraryForm } from "@/ui/components/library-form/library-form";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { EstadoEjemplar } from "@/domain/entities/devolucion";
import { createDevolucionAction, getAllDevolucionesAction, getDevolucionByIdAction } from "@/ui/actions/devolucion/devolucion.actions";

interface DevolucionSectionProps {
    session: Session;
}

export const DevolucionSection: React.FC<DevolucionSectionProps> = ({ session }) => {
    const load = useCallback(() => getAllDevolucionesAction({ session }), [session]);
    const loadDetail = useCallback((id: string) => getDevolucionByIdAction({ session, id }), [session]);

    return (
        <LibraryRecords
            title="Devoluciones"
            createLabel="Registrar devolución"
            load={load}
            loadDetail={loadDetail}
            getLabel={(devolucion) => `Devolución ${devolucion.id} · Préstamo ${devolucion.prestamoId || "—"}`}
            renderCreate={({ isSaving, save }) => (
                <LibraryForm label="Registrar devolución" isSaving={isSaving} onSubmit={(field) => void save(() => createDevolucionAction({
                    session,
                    prestamoId: field("prestamoId"),
                    fecha: field("fecha"),
                    observaciones: field("observaciones") || undefined,
                    estadoDevuelto: EstadoEjemplar.fromString(field("estadoDevuelto"))
                }))}>
                    <LibraryField name="prestamoId" label="ID de préstamo" required />
                    <LibraryField name="fecha" label="Fecha de devolución" type="date" required />
                    <LibraryField name="observaciones" label="Observaciones" />
                    <LibraryField name="estadoDevuelto" label="Estado del ejemplar" options={EstadoEjemplar.toOptions()} />
                </LibraryForm>
            )}
            renderDetail={(devolucion) => (
                <>
                    <div><strong>Préstamo:</strong> {devolucion.prestamoId || "—"}</div>
                    <div><strong>Fecha:</strong> {String(devolucion.fecha ?? "—")}</div>
                    <div><strong>Estado del ejemplar:</strong> {devolucion.estadoDevueltoName}</div>
                    <div><strong>Observaciones:</strong> {devolucion.observaciones || "—"}</div>
                </>
            )}
        />
    );
};
