import { useMemo, useState, type FormEventHandler } from "react";
import { useAuth } from "@/ui/hooks/use-auth";
import { readForm } from "@/ui/forms/handlers/read-form";
import { useFormFieldsViewModel } from "@/ui/components/library-form/viewmodel";
import type { LibraryFieldProps } from "@/ui/components/library-field/library-field";

const loginFields: LibraryFieldProps[] = [
    { name: "email", placeholder: "nombre@ejemplo.com", label: "Correo electrónico", type: "email", required: true, autoComplete: "username" },
    { name: "password", placeholder: "Ingresá tu contraseña", label: "Contraseña", type: "password", required: true, autoComplete: "current-password" }
];

export default function ViewModel() {
    const { login, isLoading, error } = useAuth();
    const [localError, setLocalError] = useState<string | null>(null);
    const form = useFormFieldsViewModel();

    {/* ===== handlers functions ===== */ }

    const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
        readForm(event, (field) => {
            const email = field("email");
            const password = field("password");
            if (!email || !password.trim()) {
                setLocalError("Completá tu correo electrónico y contraseña.");
                return;
            }
            setLocalError(null);
            void login({ email, password });
        });
    };

    {/* ===== variables ===== */ }

    const activeError = useMemo(() => {
        return localError || error;
    }, [localError, error]);

    return {
        isLoading,
        error: activeError,
        fields: form.fields(loginFields, "login"),
        onSubmit: handleSubmit
    };
}


