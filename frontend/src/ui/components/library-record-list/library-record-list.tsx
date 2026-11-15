import { LibraryButton } from "@/ui/components/library-button/library-button";
import { type ReactNode } from "react";
import { LibraryDetail } from "@/ui/components/library-detail/library-detail";
import { type LibraryRecordsView } from "@/ui/routes/use-library-records-viewmodel";
import styles from "./style.module.css";

export function LibraryRecordList({ records, detail, isSaving, renderDetailContent }:
    Pick<LibraryRecordsView, "records" | "detail" | "isSaving"> & {
        renderDetailContent?: (id: string) => ReactNode;
    }
) {
    return (
        <div>
            <div className={styles.header}>
                <h2>Registros</h2>
                <span>{records.length}</span>
            </div>
            <ul className={styles.list}>
                {records.map(({ id, label, meta, selected, select }) => (
                    <li key={id} className={styles.item} data-selected={selected}>
                        <div className={styles.row}>
                            <span className={styles.id}>#{id}</span>
                            <div className={styles.summary}>
                                <strong className={styles.label}>{label}</strong>
                                {meta && <span className={styles.meta}>{meta}</span>}
                            </div>
                            {select && (
                                <LibraryButton disabled={isSaving} aria-expanded={selected} onClick={select}>
                                    {selected ? "Cerrar detalle" : "Ver detalle"}
                                    <span className={styles.chevron} aria-hidden="true" />
                                </LibraryButton>
                            )}
                        </div>
                        {selected && detail && (
                            <LibraryDetail detail={detail} isSaving={isSaving}>
                                {!detail.loading && !detail.error && renderDetailContent?.(id)}
                            </LibraryDetail>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
