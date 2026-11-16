import { type ReactNode } from "react";
import { LibraryIcon } from "@/ui/components/library-icon/library-icon";
import styles from "./style.module.css";

const icons = { error: "alert", success: "check", empty: "empty" } as const;

export function LibraryStatus({ children, kind = "loading" }: {
    children: ReactNode;
    kind?: "loading" | "error" | "success" | "empty";
}) {
    return (
        <div className={styles[kind]} role={kind === "error" ? "alert" : "status"}>
            <span className={styles.marker} aria-hidden="true">
                {kind === "loading" ? <span className={styles.spinner} /> : <LibraryIcon name={icons[kind]} />}
            </span>
            <p>{children}</p>
        </div>
    );
}
