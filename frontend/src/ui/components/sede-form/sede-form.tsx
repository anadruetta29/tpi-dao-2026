import React, { useState } from "react";
import { type Sede } from "@/domain/entities/sede";
import { type CreateSedeCommand } from "@/domain/use-cases/sede/create-sede";

type SedeFormData = Omit<CreateSedeCommand, "session">;

export interface SedeFormProps {
    sede?: Sede;
    isLoading: boolean;
    onSubmit: (data: SedeFormData) => Promise<void>;
    onCancel: () => void;
}

const fields = [
    { name: "nombre", label: "Nombre", type: "text", maxLength: 150 },
    { name: "telefono", label: "Teléfono", type: "tel", maxLength: 50 },
    { name: "email", label: "Correo electrónico", type: "email", maxLength: 150 },
    { name: "horarioAtencion", label: "Horario de atención", type: "text", maxLength: 100 }
] as const;

export const SedeForm: React.FC<SedeFormProps> = ({ sede, isLoading, onSubmit, onCancel }) => {
    const [data, setData] = useState<SedeFormData>({
        nombre: sede?.nombre ?? "",
        telefono: sede?.telefono ?? "",
        email: sede?.email ?? "",
        horarioAtencion: sede?.horarioAtencion ?? ""
    });
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLocalError(null);

        if (!data.nombre.trim()) {
            setLocalError("Completá el nombre de la sede.");
            return;
        }

        await onSubmit({
            nombre: data.nombre.trim(),
            telefono: data.telefono.trim(),
            email: data.email.trim(),
            horarioAtencion: data.horarioAtencion.trim()
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "380px" }}>
            <h2 style={{ margin: 0 }}>{sede ? "Modificar sede" : "Registrar sede"}</h2>
            {fields.map((field) => (
                <div key={field.name} style={{ display: "flex", flexDirection: "column", gap: "0.35rem", textAlign: "left" }}>
                    <label htmlFor={`sede-${field.name}`} style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        {field.label}
                    </label>
                    <input
                        id={`sede-${field.name}`}
                        type={field.type}
                        value={data[field.name]}
                        onChange={(e) => setData({ ...data, [field.name]: e.target.value })}
                        maxLength={field.maxLength}
                        required={field.name === "nombre"}
                        disabled={isLoading}
                        style={{ padding: "0.65rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.95rem" }}
                    />
                </div>
            ))}

            {localError && (
                <div role="alert" style={{ padding: "0.65rem 0.75rem", borderRadius: "6px", backgroundColor: "#fee2e2", color: "#991b1b", fontSize: "0.875rem" }}>
                    {localError}
                </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        padding: "0.7rem 1rem",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        fontWeight: 600,
                        cursor: isLoading ? "not-allowed" : "pointer",
                        opacity: isLoading ? 0.7 : 1
                    }}
                >
                    {isLoading ? "Guardando..." : sede ? "Guardar cambios" : "Registrar sede"}
                </button>
                <button type="button" disabled={isLoading} onClick={onCancel}>
                    Cancelar
                </button>
            </div>
        </form>
    );
};
