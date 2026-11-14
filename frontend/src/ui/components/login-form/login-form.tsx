import { type FormEventHandler } from "react";
import { LibraryForm } from "@/ui/components/library-form/library-form";
import { type LibraryFieldProps } from "@/ui/components/library-field/library-field";

const fields: LibraryFieldProps[] = [
    { name: "email", placeholder: "nombre@ejemplo.com", label: "Correo electrónico", type: "email", required: true, autoComplete: "username" },
    { name: "password", placeholder: "Ingresá tu contraseña", label: "Contraseña", type: "password", required: true, autoComplete: "current-password" }
];

export function LoginForm({ isLoading, onSubmit }: { isLoading: boolean; onSubmit: FormEventHandler<HTMLFormElement> }) {
    return <LibraryForm layout="stack" label={isLoading ? "Cargando..." : "Iniciar sesión"} fields={fields} disabled={isLoading} onSubmit={onSubmit} />;
}
