import { type FormEventHandler } from "react";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryField, type LibraryFieldProps } from "@/ui/components/library-field/library-field";
import styles from "./style.module.css";

interface LibraryFormProps {
    label: string;
    fields: LibraryFieldProps[];
    isSaving?: boolean;
    disabled?: boolean;
    submitDisabled?: boolean;
    layout?: "grid" | "stack" | "filters";
    onSubmit: FormEventHandler<HTMLFormElement>;
}

export function LibraryForm({ fields, label, isSaving, disabled, submitDisabled, layout = "grid", onSubmit }: LibraryFormProps) {
    return (
        <form onSubmit={onSubmit}>
            <fieldset disabled={isSaving || disabled} className={styles[layout]}>
                {fields.map((field) => <LibraryField key={field.name} {...field} />)}
                <LibraryButton className={styles.submit} disabled={submitDisabled} type="submit" tone={layout === "filters" ? "secondary" : "primary"}>
                    {isSaving ? "Guardando..." : label}
                </LibraryButton>
            </fieldset>
        </form>
    );
}
