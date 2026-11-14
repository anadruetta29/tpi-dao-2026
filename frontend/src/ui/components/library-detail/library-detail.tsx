import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryForm } from "@/ui/components/library-form/library-form";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import { type LibraryRecordsView } from "@/ui/routes/use-library-records-viewmodel";
import styles from "./style.module.css";

export function LibraryDetail({ detail, isSaving }: {
    detail: NonNullable<LibraryRecordsView["detail"]>;
    isSaving: boolean;
}) {
    return (
        <div className={styles.detail} aria-busy={detail.loading}>
            {detail.loading && <LibraryStatus>Cargando detalle...</LibraryStatus>}
            {detail.error && <LibraryStatus kind="error">{detail.error}</LibraryStatus>}
            {detail.info.length > 0 && (
                <dl className={styles.info}>
                    {detail.info.map(({ label, value }) => (
                        <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                    ))}
                </dl>
            )}
            {detail.forms.map((form) => (
                <details className={styles.editor} key={form.label}>
                    <summary>{form.label}</summary>
                    <div><LibraryForm {...form} isSaving={isSaving} /></div>
                </details>
            ))}
            {(detail.queries.length > 0 || detail.commands.length > 0) && (
                <div className={styles.actions}>
                    {detail.queries.map(({ label, onClick }) => (
                        <LibraryButton key={label} disabled={isSaving} onClick={onClick}>{label}</LibraryButton>
                    ))}
                    {detail.commands.map(({ label, onClick }) => (
                        <LibraryButton key={label} tone="danger" disabled={isSaving} onClick={onClick}>{label}</LibraryButton>
                    ))}
                </div>
            )}
            {detail.extraLoading && <LibraryStatus>Cargando consulta...</LibraryStatus>}
            {detail.extraError && <LibraryStatus kind="error">{detail.extraError}</LibraryStatus>}
            {[...detail.sections, ...detail.extraSections].map(({ title, entries, emptyMessage }) => (
                <section className={styles.subsection} key={title}>
                    <h3>{title}</h3>
                    {entries.length ? <ul>{entries.map(({ id, label }) => <li key={id}>{label}</li>)}</ul> : <p>{emptyMessage}</p>}
                </section>
            ))}
        </div>
    );
}
