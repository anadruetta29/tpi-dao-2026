import { useState, type FormEventHandler } from "react";
import { useAuth } from "@/ui/hooks/use-auth";
import { readForm } from "@/ui/forms/handlers/read-form";

export function useViewModel() {
    const { login, isLoading, error } = useAuth();
    const [localError, setLocalError] = useState<string | null>(null);

    const onSubmit: FormEventHandler<HTMLFormElement> = (event) => readForm(event, (field) => {
        const email = field("email");
        const password = field("password");
        if (!email || !password.trim()) {
            setLocalError("Completá tu correo electrónico y contraseña.");
            return;
        }
        setLocalError(null);
        void login({ email, password });
    });

    return {
        isLoading,
        error: localError || error,
        onSubmit
    };
}
