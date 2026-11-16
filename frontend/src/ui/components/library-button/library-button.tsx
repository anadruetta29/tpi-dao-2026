import { type ComponentPropsWithoutRef } from "react";
import styles from "./style.module.css";

type Props = ComponentPropsWithoutRef<"button"> & {
    tone?: "primary" | "secondary" | "danger";
    loading?: boolean;
};

export function LibraryButton({ tone = "secondary", type = "button", className, loading, disabled, children, ...props }: Props) {
    return (
        <button type={type} className={[styles.button, styles[tone], className].filter(Boolean).join(" ")}
            {...props} disabled={disabled || loading} aria-busy={loading || props["aria-busy"]}>
            {loading && <span className={styles.spinner} aria-hidden="true" />}
            {children}
        </button>
    );
}
