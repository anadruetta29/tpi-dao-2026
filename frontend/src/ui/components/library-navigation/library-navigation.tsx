import { LibraryBrand } from "@/ui/components/library-brand/library-brand";
import styles from "./style.module.css";

export interface NavigationGroup {
    label: string;
    items: { label: string; selected: boolean; onClick: () => void }[];
}

export function LibraryNavigation({ groups }: { groups: NavigationGroup[] }) {
    return (
        <aside className={styles.sidebar}>
            <LibraryBrand />
            <nav className={styles.navigation} aria-label="Módulos de la biblioteca">
                {groups.map((group) => (
                    <section className={styles.group} aria-label={group.label} key={group.label}>
                        <h2>{group.label}</h2>
                        <ul>
                            {group.items.map(({ label, selected, onClick }) => (
                                <li key={label}>
                                    <button type="button" aria-pressed={selected} onClick={onClick}>{label}</button>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </nav>
        </aside>
    );
}
