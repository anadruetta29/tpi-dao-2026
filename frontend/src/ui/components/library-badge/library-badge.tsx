import type { StatusBadgeView } from "@/ui/components/library-records/viewmodel";
import styles from "./style.module.css";

export function LibraryBadge({ label, tone }: StatusBadgeView) {
    return <span className={styles.badge} data-tone={tone}>{label}</span>;
}
