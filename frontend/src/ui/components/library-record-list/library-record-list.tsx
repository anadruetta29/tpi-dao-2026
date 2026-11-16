import { type ReactNode } from "react";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryBadge } from "@/ui/components/library-badge/library-badge";
import { LibraryDetail } from "@/ui/components/library-detail/library-detail";
import { LibraryFormDisclosure } from "@/ui/components/library-form-disclosure/library-form-disclosure";
import { LibraryIcon } from "@/ui/components/library-icon/library-icon";
import { type LibraryRecordsView } from "@/ui/routes/use-library-records-viewmodel";
import styles from "./style.module.css";

export function LibraryRecordList({ records, detail, isSaving, renderDetailContent }:
    Pick<LibraryRecordsView, "records" | "detail" | "isSaving"> & {
        renderDetailContent?: (id: string) => ReactNode;
    }
) {
    return (
        <div className={styles.records}>
            <div className={styles.columns} aria-hidden="true">
                <span>ID</span><span>Descripción</span>
            </div>
            <ul className={styles.list}>
                {records.map(({ id, label, meta, badges, selected, select, clickRow, scrollId }) => (
                    <li key={id} className={styles.item} data-selected={selected} id={scrollId}>
                        <div className={styles.row} data-clickable={Boolean(clickRow)} onClick={clickRow}>
                            <span className={styles.id}>#{id}</span>
                            <div className={styles.summary}>
                                <strong className={styles.label}>{label}</strong>
                                {badges.length > 0 && <div className={styles.badges}>{badges.map((badge) => <LibraryBadge key={badge.label} {...badge} />)}</div>}
                                {meta && <span className={styles.meta}>{meta}</span>}
                            </div>
                            {select && (
                                <LibraryButton className={styles.open} disabled={isSaving} aria-expanded={selected} onClick={select}>
                                    {selected ? "Cerrar detalle" : "Ver detalle"}
                                    <LibraryIcon name="chevron" />
                                </LibraryButton>
                            )}
                        </div>
                        {select && (
                            <LibraryFormDisclosure>
                                {selected && detail ? (
                                    <LibraryDetail detail={detail} isSaving={isSaving}>
                                        {!detail.loading && !detail.error && renderDetailContent?.(id)}
                                    </LibraryDetail>
                                ) : null}
                            </LibraryFormDisclosure>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
