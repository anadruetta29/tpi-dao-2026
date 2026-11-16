import { LibraryIcon, type LibraryIconName } from "@/ui/components/library-icon/library-icon";
import type { Ref } from "react";
import styles from "./style.module.css";

export interface NavigationGroup {
    label: string;
    items: { label: string; accessibleLabel?: string; icon: LibraryIconName; count?: number; selected: boolean; onClick: () => void }[];
}

export function LibraryNavigation({ groups, navigationRef }: { groups: NavigationGroup[]; navigationRef?: Ref<HTMLElement> }) {
    return (
        <nav className={styles.navigation} aria-label="Módulos de la biblioteca" ref={navigationRef}>
            {groups.map((group) => (
                <section className={styles.group} aria-label={group.label} key={group.label}>
                    <h2>{group.label}</h2>
                    <ul>
                        {group.items.map(({ label, accessibleLabel, icon, count, selected, onClick }) => (
                            <li key={label}>
                                <button type="button" aria-label={accessibleLabel} aria-pressed={selected} onClick={onClick}>
                                    <span className={styles.indicator}><LibraryIcon name={icon} /></span>
                                    <span>{label}</span>
                                    {count !== undefined && <span className={styles.count} aria-hidden="true">{count}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </nav>
    );
}
