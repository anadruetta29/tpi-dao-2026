import { useId, type ComponentPropsWithoutRef, type FormEventHandler, type HTMLInputTypeAttribute, type MouseEventHandler } from "react";
import { LibraryChoices, type LibraryChoicesProps } from "@/ui/components/library-choices/library-choices";
import { LibraryIncidencias, type LibraryIncidenciasProps } from "@/ui/components/library-incidencias/library-incidencias";
import { LibrarySearchSelect, type LibrarySearchSelectProps } from "@/ui/components/library-search-select/library-search-select";
import { LibraryIcon } from "@/ui/components/library-icon/library-icon";
import styles from "./style.module.css";

interface CommonFieldProps {
    name: string;
    label: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    required?: boolean;
}

interface InputFieldProps extends CommonFieldProps {
    kind?: never;
    options?: never;
    placeholder: string;
    type?: HTMLInputTypeAttribute;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    title?: string;
    inputMode?: ComponentPropsWithoutRef<"input">["inputMode"];
    onInput?: FormEventHandler<HTMLInputElement>;
    min?: number | string;
    max?: number | string;
    step?: number | "any";
    autoComplete?: string;
    disabled?: boolean;
    passwordAction?: { label: string; icon: "eye" | "eyeOff"; pressed: boolean; run: () => void; preserveFocus: MouseEventHandler<HTMLButtonElement> };
}

interface SelectFieldProps extends CommonFieldProps {
    kind?: never;
    options: { value: string; label: string }[];
}

export type LibraryFieldProps = InputFieldProps | SelectFieldProps
    | (LibraryChoicesProps & { kind: "choices" })
    | (LibrarySearchSelectProps & { kind: "search-select" })
    | (LibraryIncidenciasProps & { kind: "incidencias" });

export function LibraryField(field: LibraryFieldProps) {
    const id = useId();
    if (field.kind === "choices") return <LibraryChoices {...field} />;
    if (field.kind === "search-select") return <LibrarySearchSelect {...field} />;
    if (field.kind === "incidencias") return <LibraryIncidencias {...field} />;

    const { name, label, defaultValue, onChange, required } = field;
    return (
        <div className={styles.field}>
            <label htmlFor={id} className={styles.label}>{label}</label>
            {field.options !== undefined ? (
                <div className={styles.select}>
                    <select id={id} name={name} defaultValue={defaultValue} onChange={(event) => onChange?.(event.target.value)} required={required} className={styles.control}>
                        {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <LibraryIcon name="chevron" />
                </div>
            ) : (
                <div className={styles.input} data-action={Boolean(field.passwordAction)}>
                <input id={id} name={name} type={field.type ?? "text"} defaultValue={defaultValue}
                    required={required} placeholder={field.placeholder} pattern={field.pattern} inputMode={field.inputMode}
                    minLength={field.minLength} maxLength={field.maxLength} title={field.title}
                    onInput={field.onInput} min={field.min} max={field.max} step={field.step} autoComplete={field.autoComplete}
                    disabled={field.disabled}
                    onChange={(event) => onChange?.(event.target.value)} className={styles.control} />
                    {field.passwordAction && (
                        <button type="button" className={styles.action} aria-label={field.passwordAction.label}
                            aria-pressed={field.passwordAction.pressed} onMouseDown={field.passwordAction.preserveFocus} onClick={field.passwordAction.run}>
                            <LibraryIcon name={field.passwordAction.icon} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
