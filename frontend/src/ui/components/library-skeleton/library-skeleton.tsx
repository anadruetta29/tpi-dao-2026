import styles from "./style.module.css";

export function LibrarySkeleton() {
    return (
        <div className={styles.rows} aria-hidden="true">
            <div><span /><span className={styles.summary} /><span /></div>
            <div><span /><span className={styles.summary} /><span /></div>
            <div><span /><span className={styles.summary} /><span /></div>
        </div>
    );
}
