import { type ReactNode } from "react";
import styles from "./style.module.css";

export function LibraryStatus({ children, kind = "loading" }: {
    children: ReactNode;
    kind?: "loading" | "error" | "success" | "empty";
}) {
    return (
        <div className={styles[kind]} role={kind === "error" ? "alert" : "status"}>
            <span className={styles.marker} aria-hidden="true" />
            <p>{children}</p>
        </div>
    );
}
