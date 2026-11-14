import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import styles from "./style.module.css";

export interface LibraryChoicesProps {
    name: string;
    label: string;
    choices: { value: string; label: string; selected: boolean }[];
    status?: { kind: "loading" | "error" | "empty"; message: string };
    retry?: () => void;
}

export function LibraryChoices({ name, label, choices, status, retry }: LibraryChoicesProps) {
    return (
        <fieldset className={styles.group}>
            <legend>{label}</legend>
            {status && <LibraryStatus kind={status.kind}>{status.message}</LibraryStatus>}
            {retry && <LibraryButton onClick={retry}>Reintentar</LibraryButton>}
            {choices.length > 0 && (
                <div className={styles.choices}>
                    {choices.map(({ value, label, selected }) => (
                        <label key={value}>
                            <input type="checkbox" name={name} value={value} defaultChecked={selected} />
                            {label}
                        </label>
                    ))}
                </div>
            )}
        </fieldset>
    );
}
