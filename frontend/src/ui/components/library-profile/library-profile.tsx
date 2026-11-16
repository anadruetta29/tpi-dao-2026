import { LibraryButton } from "@/ui/components/library-button/library-button";
import type { Ref } from "react";
import { LibraryIcon } from "@/ui/components/library-icon/library-icon";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import styles from "./style.module.css";

export interface LibraryProfileProps {
    username: string;
    initials: string;
    email?: string;
    role?: string;
    summary?: string;
    branch?: string;
    activity?: string;
    error: string | null;
    isLoading: boolean;
    onRefresh: () => void;
    onLogout: () => void;
    detailsRef?: Ref<HTMLDetailsElement>;
}

export function LibraryProfile({ username, initials, email, role, summary, branch, activity, error, isLoading, onRefresh, onLogout, detailsRef }: LibraryProfileProps) {
    return (
        <div className={styles.profile}>
            <details className={styles.account} ref={detailsRef}>
                <summary>
                    <span className={styles.avatar} aria-hidden="true">{initials}</span>
                    <span className={styles.name}><strong>{username}</strong><small title={summary}>{summary ?? role}</small></span>
                    <LibraryIcon name="chevron" />
                </summary>
                <div className={styles.panel}>
                    <header className={styles.identity}>
                        <span className={styles.avatar} aria-hidden="true">{initials}</span>
                        <div><strong>{username}</strong><span>{email}</span></div>
                        {activity && <span className={styles.activity}>{activity}</span>}
                    </header>
                    {branch && <p className={styles.branch}><LibraryIcon name="building" />{branch}</p>}
                    {error && <LibraryStatus kind="error">{error}</LibraryStatus>}
                    <LibraryButton onClick={onRefresh} disabled={isLoading}>{isLoading ? "Actualizando..." : "Actualizar perfil"}</LibraryButton>
                    <LibraryButton onClick={onLogout}>Cerrar sesión</LibraryButton>
                </div>
            </details>
        </div>
    );
}
