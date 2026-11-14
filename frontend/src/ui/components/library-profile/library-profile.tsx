import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import styles from "./style.module.css";

export interface LibraryProfileProps {
    username: string;
    initials: string;
    email?: string;
    role?: string;
    activity?: string;
    error: string | null;
    isLoading: boolean;
    onRefresh: () => void;
    onLogout: () => void;
}

export function LibraryProfile({ username, initials, email, role, activity, error, isLoading, onRefresh, onLogout }: LibraryProfileProps) {
    return (
        <div className={styles.profile}>
            <details className={styles.account}>
                <summary>
                    <span className={styles.avatar} aria-hidden="true">{initials}</span>
                    <span className={styles.name}><strong>{username}</strong><small>{role}</small></span>
                </summary>
                <div className={styles.panel}>
                    <div className={styles.identity}><strong>{username}</strong><span>{email}</span><span>{activity}</span></div>
                    {error && <LibraryStatus kind="error">{error}</LibraryStatus>}
                    <LibraryButton onClick={onRefresh} disabled={isLoading}>{isLoading ? "Actualizando..." : "Actualizar perfil"}</LibraryButton>
                    <LibraryButton onClick={onLogout}>Cerrar sesión</LibraryButton>
                </div>
            </details>
        </div>
    );
}
