import { useMemo, useState, type FormEventHandler } from "react";
import { useAuth } from "@/ui/hooks/use-auth";
import { readForm } from "@/ui/forms/handlers/read-form";

export default function ViewModel() {
    const { login, isLoading, error } = useAuth();
    const [localError, setLocalError] = useState<string | null>(null);

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
        onSubmit: handleSubmit
    };
}


