import type { ReactElement, TransitionEventHandler } from "react";
import { useFormDisclosureViewModel } from "@/ui/components/library-form-disclosure/viewmodel";
import styles from "./style.module.css";

function DisclosureView({ content, open, version, onTransitionEnd }: {
    content: ReactElement | null;
    open: boolean;
    version: number;
    onTransitionEnd: TransitionEventHandler<HTMLDivElement>;
}) {
    return (
        <div className={styles.disclosure} data-open={open} inert={!open} aria-hidden={!open || undefined} onTransitionEnd={onTransitionEnd}>
            <div className={styles.clip}>
                {content && <div key={version} className={styles.content}>{content}</div>}
            </div>
        </div>
    );
}

export function LibraryFormDisclosure({ children }: { children: ReactElement | null }) {
    return <DisclosureView {...useFormDisclosureViewModel(children)} />;
}
