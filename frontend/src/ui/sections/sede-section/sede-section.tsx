import React, { useEffect, useState } from "react";
import { type ActionState } from "@/core/types";
import { EstadoSede, type Sede } from "@/domain/entities/sede";
import { Rol } from "@/domain/entities/rol";
import { type Session } from "@/domain/entities/session";
import { ErrorMessages } from "@/domain/messages";
import { type CreateSedeCommand } from "@/domain/use-cases/sede/create-sede";
import {
    createSedeAction,
    deleteSedeAction,
    getAllSedesAction,
    getSedeByIdAction,
    updateSedeAction
} from "@/ui/actions/sede/sede.actions";
import { SedeForm } from "@/ui/components/sede-form/sede-form";
import { useAuth } from "@/ui/hooks/use-auth";

export interface SedeSectionProps {
    session: Session;
}

const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "1rem",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    textAlign: "left",
    overflowWrap: "anywhere"
};

const buttonStyle: React.CSSProperties = {
    padding: "0.55rem 0.9rem",
    borderRadius: "6px",
    border: "1px solid #2563eb",
    backgroundColor: "transparent",
    color: "#2563eb",
    fontWeight: 600
};

const buttonsStyle: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.75rem" };

export const SedeSection: React.FC<SedeSectionProps> = ({ session }) => {
    const { user } = useAuth();
    const isAdmin = user?.roleEntity.value === Rol.ADMIN.value;
    const [estado, setEstado] = useState<EstadoSede>();
    const [sedes, setSedes] = useState<ActionState<Sede[]> | null>(null);
    const [revision, setRevision] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detail, setDetail] = useState<ActionState<Sede> | null>(null);
    const [form, setForm] = useState<"create" | "update" | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [mutation, setMutation] = useState<ActionState<null> | null>(null);

    useEffect(() => {
        let ignore = false;
        void getAllSedesAction({ estado, session }).then((result) => {
            if (!ignore) setSedes(result);
        });
        return () => {
            ignore = true;
        };
    }, [estado, session, revision]);

    useEffect(() => {
        if (!selectedId) return;

        let ignore = false;
        void getSedeByIdAction({ id: selectedId, session }).then((result) => {
            if (!ignore) setDetail(result);
        });
        return () => {
            ignore = true;
        };
    }, [selectedId, session]);

    const selectSede = (id: string | null) => {
        if (id !== selectedId) setDetail(null);
        setSelectedId(id);
        setForm(null);
        setConfirmDelete(false);
        setMutation(null);
    };

    const refreshSedes = () => {
        setSedes(null);
        setRevision((current) => current + 1);
    };

    const handleMutation = async (action: () => Promise<ActionState<null>>) => {
        if (!isAdmin || isSaving) return;

        setIsSaving(true);
        setMutation(null);

        const result = await action();
        if (result.success) {
            selectSede(null);
            refreshSedes();
        }

        setMutation(result);
        setIsSaving(false);
    };

    const handleSave = async (data: Omit<CreateSedeCommand, "session">) => {
        if (form === "update" && selectedId) {
            await handleMutation(() => updateSedeAction({ ...data, id: selectedId, session }));
        } else if (form === "create") {
            await handleMutation(() => createSedeAction({ ...data, session }));
        }
    };

    const sede = detail?.data;
    const cancelForm = () => {
        setForm(null);
        setMutation(null);
    };

    return (
        <section aria-labelledby="sedes-title" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "2rem" }}>
            <h2 id="sedes-title" style={{ margin: 0 }}>Sedes</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "520px" }}>
                <div style={{ ...buttonsStyle, alignItems: "center" }}>
                    <label htmlFor="sedes-estado">Estado</label>
                    <select
                        id="sedes-estado"
                        value={estado?.value ?? ""}
                        disabled={isSaving}
                        onChange={(e) => {
                            const value = e.target.value;
                            selectSede(null);
                            setSedes(null);
                            setEstado(value ? EstadoSede.fromString(value) : undefined);
                        }}
                        style={{ padding: "0.55rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    >
                        <option value="">Todos</option>
                        {EstadoSede.toOptions().map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    {isAdmin && !form && (
                        <button type="button" style={buttonStyle} disabled={isSaving} onClick={() => {
                            selectSede(null);
                            setForm("create");
                        }}>
                            Registrar sede
                        </button>
                    )}
                </div>

                {mutation?.success && <p role="status">{mutation.message}</p>}
                {mutation && !mutation.success && (
                    <p role="alert" style={{ padding: "0.65rem 0.75rem", borderRadius: "6px", backgroundColor: "#fee2e2", color: "#991b1b" }}>
                        {mutation.error || ErrorMessages.UNEXPECTED_ERROR}
                    </p>
                )}

                {isAdmin && form === "create" && (
                    <SedeForm
                        isLoading={isSaving}
                        onSubmit={handleSave}
                        onCancel={cancelForm}
                    />
                )}

                {!sedes && <p role="status">Cargando sedes...</p>}
                {sedes && !sedes.success && (
                    <div style={cardStyle}>
                        <p role="alert">{sedes.error || ErrorMessages.SEDE_LIST_ERROR}</p>
                        <button type="button" style={buttonStyle} disabled={isSaving} onClick={refreshSedes}>Reintentar</button>
                    </div>
                )}
                {sedes?.data?.length === 0 && <p>No hay sedes para el estado seleccionado.</p>}
                {Boolean(sedes?.data?.length) && (
                    <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem", margin: 0, padding: 0, listStyle: "none" }}>
                        {sedes?.data?.map((item) => (
                            <li key={item.id} style={cardStyle}>
                                <div><strong>{item.nombre || "Sede sin nombre"}</strong> · {item.estadoName}</div>
                                <div style={buttonsStyle}>
                                    <button
                                        type="button"
                                        aria-label={`${selectedId === item.id ? "Cerrar" : "Ver"} detalle de ${item.nombre || "la sede"}`}
                                        aria-expanded={selectedId === item.id}
                                        disabled={isSaving}
                                        style={buttonStyle}
                                        onClick={() => selectSede(selectedId === item.id ? null : item.id)}
                                    >
                                        {selectedId === item.id ? "Cerrar detalle" : "Ver detalle"}
                                    </button>
                                </div>
                                {selectedId === item.id && !detail && <p role="status">Cargando sede...</p>}
                                {selectedId === item.id && detail && !detail.success && (
                                    <p role="alert">{detail.error || ErrorMessages.SEDE_DETAIL_ERROR}</p>
                                )}
                                {selectedId === item.id && sede && (
                                    <>
                                        <div><strong>Teléfono:</strong> {sede.telefono || "—"}</div>
                                        <div><strong>Correo electrónico:</strong> {sede.email || "—"}</div>
                                        <div><strong>Horario de atención:</strong> {sede.horarioAtencion || "—"}</div>
                                        <div><strong>Estado:</strong> {sede.estadoName}</div>
                                        {isAdmin && form === "update" && (
                                            <SedeForm
                                                sede={sede}
                                                isLoading={isSaving}
                                                onSubmit={handleSave}
                                                onCancel={cancelForm}
                                            />
                                        )}
                                        {isAdmin && !form && !confirmDelete && (
                                            <div style={buttonsStyle}>
                                                <button type="button" style={buttonStyle} onClick={() => {
                                                    setMutation(null);
                                                    setForm("update");
                                                }}>
                                                    Modificar sede
                                                </button>
                                                {sede.estado === EstadoSede.ACTIVA && (
                                                    <button type="button" style={{ ...buttonStyle, color: "#dc2626", borderColor: "#dc2626" }} onClick={() => {
                                                        setMutation(null);
                                                        setConfirmDelete(true);
                                                    }}>
                                                        Dar de baja
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {isAdmin && confirmDelete && (
                                            <>
                                                <p>¿Querés dar de baja esta sede?</p>
                                                <div style={buttonsStyle}>
                                                    <button
                                                        type="button"
                                                        style={{ ...buttonStyle, color: "#dc2626", borderColor: "#dc2626" }}
                                                        disabled={isSaving}
                                                        onClick={() => void handleMutation(() => deleteSedeAction({ id: sede.id, session }))}
                                                    >
                                                        {isSaving ? "Dando de baja..." : "Confirmar baja"}
                                                    </button>
                                                    <button type="button" disabled={isSaving} onClick={() => {
                                                        setConfirmDelete(false);
                                                        setMutation(null);
                                                    }}>
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
};
