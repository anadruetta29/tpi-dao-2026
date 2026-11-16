import { type Libro } from "@/domain/entities/libro";
import { digitsInput } from "@/ui/forms/handlers/input-format";
import { type Field } from "@/ui/routes/use-library-records-viewmodel";

const onYearInput = digitsInput(4);

export function bookFields(
    authors: Field,
    currentYear: number,
    libro?: Libro
): Field[] {
    return [
        {
            name: "titulo",
            placeholder: "Ej. El Aleph",
            label: "Título",
            required: true,
            defaultValue: libro?.titulo
        },
        {
            name: "añoPublicacion",
            label: "Año de publicación",
            placeholder: "Ej. 1949",
            inputMode: "numeric",
            pattern: "[0-9]{1,4}",
            title: `Ingresá un año entre 1 y ${currentYear}.`,
            onInput: (event) => {
                onYearInput(event);

                const input = event.currentTarget;
                const year = Number(input.value);

                input.setCustomValidity(
                    input.value && (year < 1 || year > currentYear)
                        ? `Ingresá un año entre 1 y ${currentYear}.`
                        : ""
                );
            },
            required: true,
            defaultValue: libro?.añoPublicacion
                ? String(libro.añoPublicacion)
                : undefined
        },
        {
            name: "editorial",
            placeholder: "Ej. Losada",
            label: "Editorial",
            required: true,
            defaultValue: libro?.editorial
        },
        {
            name: "edicion",
            placeholder: "Ej. Primera edición",
            label: "Edición",
            required: true,
            defaultValue: libro?.edicion
        },
        authors
    ];
}