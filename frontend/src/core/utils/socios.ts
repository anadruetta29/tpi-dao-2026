import type { Socio } from "@/domain/entities/socio";
import { digitsInput, lettersInput } from "@/ui/forms/handlers/input-format";
import type { ReadField } from "@/ui/forms/handlers/read-form";
import { readFields } from "@/ui/forms/handlers/record-fields";
import type { Field } from "@/ui/routes/use-library-records-viewmodel";

const nameFormat = {
    pattern: "(?=.{2,100}$)\\p{L}+(?: +\\p{L}+)*",
    minLength: 2,
    maxLength: 100,
    title: "Ingresá entre 2 y 100 caracteres, solo letras y espacios.",
    onInput: lettersInput
};

export default function socioFields(socio?: Socio): Field[] {
    return [
        { name: "nombre", placeholder: "Ej. Ana", label: "Nombre", defaultValue: socio?.nombre, required: true, ...nameFormat },
        { name: "apellido", placeholder: "Ej. Pérez", label: "Apellido", defaultValue: socio?.apellido, required: true, ...nameFormat },
        {
            name: "documento", placeholder: "Ej. 30123456", label: "DNI", defaultValue: socio?.documento, required: true,
            inputMode: "numeric", pattern: "(?=[0-9]*[1-9])[0-9]{7,8}",
            title: "Ingresá un DNI positivo de 7 u 8 dígitos.", onInput: digitsInput(8)
        },
        { name: "email", placeholder: "socio@ejemplo.com", label: "Correo electrónico", type: "email", defaultValue: socio?.email, required: true },
        {
            name: "telefono", placeholder: "Ej. 1155551234", label: "Teléfono", type: "tel", defaultValue: socio?.telefono,
            required: true, inputMode: "numeric", pattern: "[0-9]{1,10}",
            title: "Ingresá hasta 10 dígitos.", onInput: digitsInput(10)
        }
    ];
}

export const socioData = (field: ReadField) => readFields(field, "nombre", "apellido", "documento", "email", "telefono");