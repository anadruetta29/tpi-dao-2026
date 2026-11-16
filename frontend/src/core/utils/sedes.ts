import type { Sede } from "@/domain/entities/sede";
import { digitsInput } from "@/ui/forms/handlers/input-format";
import { onTimeInput } from "./horario-input";
import type { Field } from "@/ui/routes/use-library-records-viewmodel";
import type { ReadField } from "@/ui/forms/handlers/read-form";
import { readFields } from "@/ui/forms/handlers/record-fields";

const horaPattern = "(?:[01][0-9]|2[0-3]):[0-5][0-9]";
const rangoHorario = new RegExp(`^(${horaPattern})\\s*-\\s*(${horaPattern})$`);

const timeField = {
    pattern: horaPattern,
    required: true,
    inputMode: "numeric",
    onInput: onTimeInput
} as const;

export function sedeFields(sede?: Sede): Field[] {
    const horario = rangoHorario.exec(sede?.horarioAtencion.trim() ?? "");
    return [
        { name: "nombre", placeholder: "Ej. Biblioteca Central", label: "Nombre", defaultValue: sede?.nombre, required: true },
        {
            name: "telefono", placeholder: "Ej. 1155551234", label: "Teléfono", type: "tel",
            defaultValue: sede?.telefono, required: true, inputMode: "numeric", pattern: "[0-9]{1,10}",
            title: "Ingresá hasta 10 dígitos.", onInput: digitsInput(10)
        },
        { name: "email", placeholder: "sede@ejemplo.com", label: "Correo electrónico", type: "email", defaultValue: sede?.email, required: true },
        { ...timeField, name: "apertura", placeholder: "Ingresá la hora de apertura", label: "Apertura", defaultValue: horario?.[1] },
        { ...timeField, name: "cierre", placeholder: "Ingresá la hora de cierre", label: "Cierre", defaultValue: horario?.[2] }
    ];
}

export function sedeData(field: ReadField) {
    const apertura = field("apertura");
    const cierre = field("cierre");
    const horarioAtencion = `${apertura} - ${cierre}`;
    if (!rangoHorario.test(horarioAtencion) || apertura >= cierre) return null;

    return { ...readFields(field, "nombre", "telefono", "email"), horarioAtencion };
}