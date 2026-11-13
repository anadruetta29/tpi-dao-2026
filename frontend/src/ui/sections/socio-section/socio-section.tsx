import React, { useCallback, useState } from "react";
import { type Session } from "@/domain/entities/session";
import { LibraryField } from "@/ui/components/library-field/library-field";
import { LibraryForm } from "@/ui/components/library-form/library-form";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { EstadoSocio, type Socio } from "@/domain/entities/socio";
import {
    createSocioAction,
    deleteSocioAction,
    getAllSociosAction,
    getSocioByIdAction,
    updateSocioAction
} from "@/ui/actions/socio/socio.actions";
import { libraryButtonStyle, libraryControlsStyle } from "@/ui/components/library-records/library-records.styles";
import { SocioHistory } from "@/ui/components/socio-history/socio-history";

interface SocioSectionProps {
    session: Session;
}

const fields = [
    { name: "nombre", label: "Nombre" },
    { name: "apellido", label: "Apellido" },
    { name: "documento", label: "Documento" },
    { name: "email", label: "Correo electrónico", type: "email" },
    { name: "telefono", label: "Teléfono", type: "tel" }
] as const;

const socioFields = (socio?: Socio) => fields.map((field) => (
    <LibraryField key={field.name} {...field} defaultValue={socio?.[field.name]} required />
));

const readSocio = (field: (name: string) => string) => ({
    nombre: field("nombre"),
    apellido: field("apellido"),
    documento: field("documento"),
    email: field("email"),
    telefono: field("telefono")
});

export const SocioSection: React.FC<SocioSectionProps> = ({ session }) => {
    const [filters, setFilters] = useState({ q: "", documento: "", estado: "" });
    const load = useCallback(() => getAllSociosAction({
        session,
        q: filters.q,
        documento: filters.documento,
        estado: filters.estado ? EstadoSocio.fromString(filters.estado) : undefined
    }), [session, filters]);
    const loadDetail = useCallback((id: string) => getSocioByIdAction({ session, id }), [session]);

    return (
        <LibraryRecords
            title="Socios"
            createLabel="Registrar socio"
            load={load}
            loadDetail={loadDetail}
            getLabel={(socio) => `${socio.apellido}, ${socio.nombre} · ${socio.documento} · ${socio.estadoName}`}
            filters={(
                <LibraryForm label="Buscar" onSubmit={(field) => setFilters({
                    q: field("q"),
                    documento: field("documento"),
                    estado: field("estado")
                })}>
                    <LibraryField name="q" label="Nombre o apellido" />
                    <LibraryField name="documento" label="Documento" />
                    <LibraryField name="estado" label="Estado" options={[{ value: "", label: "Todos" }, ...EstadoSocio.toOptions()]} />
                </LibraryForm>
            )}
            renderCreate={({ isSaving, save }) => (
                <LibraryForm label="Registrar socio" isSaving={isSaving} onSubmit={(field) => void save(() => createSocioAction({ session, ...readSocio(field) }))}>
                    {socioFields()}
                </LibraryForm>
            )}
            renderDetail={(socio, { isSaving, save }) => (
                <>
                    <div><strong>ID de socio:</strong> {socio.id}</div>
                    <div><strong>Correo electrónico:</strong> {socio.email || "—"}</div>
                    <div><strong>Teléfono:</strong> {socio.telefono || "—"}</div>
                    <div><strong>Estado:</strong> {socio.estadoName}</div>
                    <details>
                        <summary>Modificar socio</summary>
                        <LibraryForm label="Guardar cambios" isSaving={isSaving} onSubmit={(field) => void save(() => updateSocioAction({ session, id: socio.id, ...readSocio(field) }))}>
                            {socioFields(socio)}
                        </LibraryForm>
                    </details>
                    {socio.estadoEntity === EstadoSocio.HABILITADO && (
                        <details>
                            <summary>Dar de baja</summary>
                            <div style={libraryControlsStyle}>
                                <p>¿Querés inhabilitar a este socio?</p>
                                <button type="button" style={{ ...libraryButtonStyle, color: "#dc2626", borderColor: "#dc2626" }} disabled={isSaving} onClick={() => void save(() => deleteSocioAction({ session, id: socio.id }))}>
                                    Confirmar baja
                                </button>
                            </div>
                        </details>
                    )}
                    <SocioHistory id={socio.id} session={session} />
                </>
            )}
        />
    );
};
