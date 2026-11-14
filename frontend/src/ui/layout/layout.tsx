import { type ReactNode } from "react";
import { LibraryNavigation, type NavigationGroup } from "@/ui/components/library-navigation/library-navigation";
import { LibraryProfile, type LibraryProfileProps } from "@/ui/components/library-profile/library-profile";
import styles from "./style.module.css";

export function Layout({ navigation, area, profile, children }: {
    navigation: NavigationGroup[];
    area: string;
    profile: LibraryProfileProps;
    children: ReactNode;
}) {
    return (
        <div className={styles.layout}>
            <LibraryNavigation groups={navigation} />
            <div className={styles.workspace}>
                <header className={styles.bar}>
                    <span>{area}</span>
                    <LibraryProfile {...profile} />
                </header>
                <main className={styles.content}>{children}</main>
            </div>
        </div>
    );
}
