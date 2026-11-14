import styles from "./style.module.css";

export function LibraryBrand() {
    return (
        <div className={styles.brand}>
            <span className={styles.mark} aria-hidden="true"><i /><i /><i /></span>
            <span>Biblioteca</span>
        </div>
    );
}
