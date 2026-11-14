import { useId, type ComponentPropsWithoutRef, type FormEventHandler, type HTMLInputTypeAttribute } from "react";
import { LibraryChoices, type LibraryChoicesProps } from "@/ui/components/library-choices/library-choices";
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
    inputMode?: ComponentPropsWithoutRef<"input">["inputMode"];
    onInput?: FormEventHandler<HTMLInputElement>;
    min?: number;
    max?: number;
    step?: number | "any";
    autoComplete?: string;
}

interface SelectFieldProps extends CommonFieldProps {
    kind?: never;
    options: { value: string; label: string }[];
}

export type LibraryFieldProps = InputFieldProps | SelectFieldProps | (LibraryChoicesProps & { kind: "choices" });

export function LibraryField(field: LibraryFieldProps) {
    const id = useId();
    if (field.kind === "choices") return <LibraryChoices {...field} />;

    const { name, label, defaultValue, onChange, required } = field;
    return (
        <div className={styles.field}>
            <label htmlFor={id} className={styles.label}>{label}</label>
            {field.options !== undefined ? (
                <select id={id} name={name} defaultValue={defaultValue} onChange={(event) => onChange?.(event.target.value)} required={required} className={styles.control}>
                    {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
            ) : (
                <input id={id} name={name} type={field.type ?? "text"} defaultValue={defaultValue}
                    required={required} placeholder={field.placeholder} pattern={field.pattern} inputMode={field.inputMode}
                    onInput={field.onInput} min={field.min} max={field.max} step={field.step} autoComplete={field.autoComplete}
                    onChange={(event) => onChange?.(event.target.value)} className={styles.control} />
            )}
        </div>
    );
}
