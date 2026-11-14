import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryForm } from "@/ui/components/library-form/library-form";
import { LibraryRecordList } from "@/ui/components/library-record-list/library-record-list";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import { type LibraryRecordsView } from "@/ui/routes/use-library-records-viewmodel";
import styles from "./style.module.css";

export function LibraryRecords({ view }: { view: LibraryRecordsView }) {
    return (
        <section aria-label={view.title} className={styles.module}>
            <header className={styles.heading}>
                <h1>{view.title}</h1>
                {view.createLabel && (
                    <LibraryButton tone={view.create ? "secondary" : "primary"} aria-expanded={Boolean(view.create)}
                        disabled={view.isSaving} onClick={view.toggleCreate}>
                        {!view.create && <span className={styles.plus} aria-hidden="true">+</span>}
                        {view.createLabel}
                    </LibraryButton>
                )}
            </header>
            {view.feedback && <LibraryStatus kind={view.feedback.error ? "error" : "success"}>{view.feedback.message}</LibraryStatus>}
            {view.create && (
                <div className={styles.editor}>
                    <h2>{view.create.label}</h2>
                    <LibraryForm {...view.create} isSaving={view.isSaving} />
                </div>
            )}
            <div className={styles.panel} aria-busy={view.loading}>
                {view.filter && (
                    <div className={styles.toolbar}>
                        <LibraryForm {...view.filter} disabled={view.isSaving} layout="filters" />
                    </div>
                )}
                {view.loading ? (
                    <div className={styles.status}><LibraryStatus>Cargando registros...</LibraryStatus></div>
                ) : view.error ? (
                    <div className={styles.status}>
                        <LibraryStatus kind="error">{view.error}</LibraryStatus>
                        <LibraryButton disabled={view.isSaving} onClick={view.refresh}>Reintentar</LibraryButton>
                    </div>
                ) : view.records.length === 0 ? (
                    <div className={styles.status}><LibraryStatus kind="empty">No hay resultados.</LibraryStatus></div>
                ) : (
                    <LibraryRecordList records={view.records} detail={view.detail} isSaving={view.isSaving} />
                )}
            </div>
        </section>
    );
}
