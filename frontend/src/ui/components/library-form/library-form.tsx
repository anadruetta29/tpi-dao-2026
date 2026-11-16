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
    onClear?: () => void;
    clearLabel?: string;
    clearDisabled?: boolean;
    savingLabel?: string;
    onChange?: FormEventHandler<HTMLFormElement>;
    revision?: number;
}

export function LibraryForm({ fields, label, isSaving, disabled, submitDisabled, layout = "grid", onSubmit, onClear,
    clearLabel = "Limpiar filtros", clearDisabled, savingLabel = "Guardando...", onChange, revision }: LibraryFormProps) {
    return (
        <form onSubmit={onSubmit} onChange={onChange}>
            <fieldset disabled={isSaving || disabled} className={styles[layout]}>
                <div className={styles.fields} key={revision}>
                    {fields.map((field) => <LibraryField key={field.name} {...field} />)}
                </div>
                <div className={styles.footer}>
                    <LibraryButton className={styles.submit} disabled={submitDisabled} loading={isSaving} type="submit" tone={layout === "filters" ? "secondary" : "primary"}>
                        {isSaving ? savingLabel : label}
                    </LibraryButton>
                    {onClear && <LibraryButton onClick={onClear} disabled={clearDisabled}>{clearLabel}</LibraryButton>}
                </div>
            </fieldset>
        </form>
    );
}
