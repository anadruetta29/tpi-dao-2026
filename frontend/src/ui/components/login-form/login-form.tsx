import { type FormEventHandler } from "react";
import { LibraryForm } from "@/ui/components/library-form/library-form";
import { type LibraryFieldProps } from "@/ui/components/library-field/library-field";

export function LoginForm({ fields, isLoading, onSubmit }: { fields: LibraryFieldProps[]; isLoading: boolean; onSubmit: FormEventHandler<HTMLFormElement> }) {
    return <LibraryForm layout="stack" label={isLoading ? "Cargando..." : "Iniciar sesión"} fields={fields} disabled={isLoading} isSaving={isLoading} onSubmit={onSubmit} />;
}
