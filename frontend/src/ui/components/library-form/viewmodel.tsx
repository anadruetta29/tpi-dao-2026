import { useState } from "react";
import type { LibraryFieldProps } from "@/ui/components/library-field/library-field";

export function useFormFieldsViewModel() {
    const [visible, setVisible] = useState<Record<string, boolean>>({});

    return {
        clear: () => setVisible({}),
        fields: (fields: LibraryFieldProps[], scope: string): LibraryFieldProps[] => fields.map((field) => {
            if (field.kind || field.options !== undefined || field.type !== "password") return field;
            const key = `${scope}:${field.name}`;
            return {
                ...field,
                type: visible[key] ? "text" : "password",
                passwordAction: {
                    label: visible[key] ? "Ocultar contraseña" : "Mostrar contraseña",
                    icon: visible[key] ? "eyeOff" : "eye",
                    pressed: Boolean(visible[key]),
                    preserveFocus: (event) => event.preventDefault(),
                    run: () => setVisible((current) => ({ ...current, [key]: !current[key] }))
                }
            };
        })
    };
}
