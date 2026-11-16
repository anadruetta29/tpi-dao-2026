import { LibraryIcon } from "@/ui/components/library-icon/library-icon";
import type { ThemeView } from "@/ui/layout/viewmodel";
import styles from "./style.module.css";

export function LibraryThemeButton({ icon, label, toggle }: ThemeView) {
    return <button type="button" className={styles.button} aria-label={label} title={label} onClick={toggle}><LibraryIcon name={icon} /></button>;
}
