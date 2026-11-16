import { type ReactNode, type Ref } from "react";
import { LibraryBrand } from "@/ui/components/library-brand/library-brand";
import { LibraryNavigation, type NavigationGroup } from "@/ui/components/library-navigation/library-navigation";
import { LibraryProfile, type LibraryProfileProps } from "@/ui/components/library-profile/library-profile";
import { LibraryIcon } from "@/ui/components/library-icon/library-icon";
import { LibraryThemeButton } from "@/ui/components/library-theme-button/library-theme-button";
import type { ThemeView } from "./viewmodel";
import styles from "./style.module.css";

export function Layout({ navigation, navigationRef, area, branch, profile, theme, children }: {
    navigation: NavigationGroup[];
    navigationRef?: Ref<HTMLElement>;
    area: string;
    branch?: string;
    profile: LibraryProfileProps;
    theme: ThemeView;
    children: ReactNode;
}) {
    return (
        <div className={styles.layout}>
            <header className={styles.bar}>
                <LibraryBrand />
                <div className={styles.area}>
                    <span>{area}</span>
                    {branch && <span className={styles.branch}><LibraryIcon name="building" />{branch}</span>}
                </div>
                <div className={styles.account}><LibraryThemeButton {...theme} /><LibraryProfile {...profile} /></div>
            </header>
            <div className={styles.rail}>
                <LibraryNavigation groups={navigation} navigationRef={navigationRef} />
            </div>
            <main className={styles.content}>{children}</main>
        </div>
    );
}
