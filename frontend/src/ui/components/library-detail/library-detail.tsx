import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryBadge } from "@/ui/components/library-badge/library-badge";
import { type ReactNode } from "react";
import { LibraryForm } from "@/ui/components/library-form/library-form";
import { LibraryIcon } from "@/ui/components/library-icon/library-icon";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import { type DetailSection, type LibraryRecordsView } from "@/ui/routes/use-library-records-viewmodel";
import styles from "./style.module.css";

function DetailEntries({ section }: { section: DetailSection }) {
    if (!section.entries.length) return <p>{section.emptyMessage}</p>;
    if (section.kind !== "timeline") {
        return (
            <ul className={styles.entryList} role="list">
                {section.entries.map(({ id, label, detail, badge }) => (
                    <li key={id} className={styles.entry}>
                        <div><strong>{label}</strong>{detail && <p>{detail}</p>}</div>
                        {badge && <LibraryBadge {...badge} />}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <ol className={styles.timeline}>
            {section.entries.map(({ id, label, metadata, current }) => (
                    <li key={id} className={styles.timelineItem} aria-current={current ? "step" : undefined}>
                        <span className={styles.timelineDot} aria-hidden="true" />
                        <div className={styles.timelineEvent}>
                            <div className={styles.timelineHeader}>
                                <strong>{label}</strong>
                                {current && <span className={styles.timelineBadge}>Último estado</span>}
                            </div>
                            {metadata.length > 0 && (
                                <dl className={styles.timelineMeta}>
                                    {metadata.map(({ label: term, value }) => (
                                        <div key={term}><dt>{term}</dt><dd>{value}</dd></div>
                                    ))}
                                </dl>
                            )}
                        </div>
                    </li>
            ))}
        </ol>
    );
}

export function LibraryDetail({ detail, isSaving, children }: {
    detail: NonNullable<LibraryRecordsView["detail"]>;
    isSaving: boolean;
    children?: ReactNode;
}) {
    return (
        <div className={styles.detail} aria-busy={detail.loading}>
            {detail.loading && <LibraryStatus>Cargando detalle...</LibraryStatus>}
            {detail.error && <LibraryStatus kind="error">{detail.error}</LibraryStatus>}
            <div className={styles.inspector}>
                {detail.info.length > 0 && (
                    <section className={styles.facts} aria-label="Ficha">
                        <h4>Ficha</h4>
                        <dl className={styles.info}>
                            {detail.info.map(({ label, value, badge }) => (
                                <div key={label}><dt>{label}</dt><dd>{badge ? <LibraryBadge {...badge} /> : value}</dd></div>
                            ))}
                        </dl>
                    </section>
                )}
                {(detail.forms.length > 0 || detail.queries.length > 0 || detail.commands.length > 0) && (
                    <section className={styles.controls} aria-label="Acciones del registro">
                        <h4>Acciones</h4>
                        {detail.forms.map((form) => (
                            <details className={styles.editor} key={form.label}>
                                <summary>{form.label}<LibraryIcon name="chevron" /></summary>
                                <div><LibraryForm {...form} isSaving={isSaving} /></div>
                            </details>
                        ))}
                        <div className={styles.actions}>
                            {detail.queries.map(({ label, onClick }) => (
                                <LibraryButton key={label} disabled={isSaving} onClick={onClick}>{label}</LibraryButton>
                            ))}
                            {detail.commands.map(({ label, onClick, tone = "danger" }) => (
                                <LibraryButton key={label} tone={tone} disabled={isSaving} onClick={onClick}>{label}</LibraryButton>
                            ))}
                        </div>
                    </section>
                )}
            </div>
            {detail.extraLoading && <LibraryStatus>Cargando consulta...</LibraryStatus>}
            {detail.extraError && <LibraryStatus kind="error">{detail.extraError}</LibraryStatus>}
            {[...detail.sections, ...detail.extraSections].map((section) => (
                <section className={styles.subsection} key={section.title}>
                    <h3>{section.title}</h3>
                    <DetailEntries section={section} />
                </section>
            ))}
            {children}
        </div>
    );
}
