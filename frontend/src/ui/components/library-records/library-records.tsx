import { type ReactNode } from "react";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryBadge } from "@/ui/components/library-badge/library-badge";
import { LibraryForm } from "@/ui/components/library-form/library-form";
import { LibraryFormDisclosure } from "@/ui/components/library-form-disclosure/library-form-disclosure";
import { LibraryIcon } from "@/ui/components/library-icon/library-icon";
import { LibraryRecordList } from "@/ui/components/library-record-list/library-record-list";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import { LibrarySkeleton } from "@/ui/components/library-skeleton/library-skeleton";
import { type LibraryRecordsView } from "@/ui/routes/use-library-records-viewmodel";
import styles from "./style.module.css";

export function LibraryRecords({ view, renderDetailContent, headingLevel = 1 }: {
    view: LibraryRecordsView;
    renderDetailContent?: (id: string) => ReactNode;
    headingLevel?: 1 | 2;
}) {
    const Heading = headingLevel === 1 ? "h1" : "h2";
    const Subheading = headingLevel === 1 ? "h2" : "h3";
    return (
        <section aria-label={view.title} className={styles.module} data-nested={headingLevel === 2}>
            <header className={styles.heading}>
                <div className={styles.title}>
                    <span className={styles.emblem}><LibraryIcon name={view.icon} /></span>
                    <Heading>{view.title}</Heading>
                </div>
                {view.createLabel && (
                    <LibraryButton className={styles.createToggle} tone={view.create ? "secondary" : "primary"} aria-expanded={Boolean(view.create)}
                        disabled={view.isSaving} onClick={view.toggleCreate}>
                        <LibraryIcon name={view.create ? "close" : "plus"} />
                        {view.createLabel}
                    </LibraryButton>
                )}
            </header>
            {view.feedback && <LibraryStatus kind={view.feedback.error ? "error" : "success"}>{view.feedback.message}</LibraryStatus>}
            <div className={styles.workspace}>
                <LibraryFormDisclosure>
                    {view.create ? (
                        <section className={styles.editor} aria-label={view.create.label} id={view.createId}>
                            <div className={styles.editorTitle}>
                                <span className={styles.emblem}><LibraryIcon name="plus" /></span>
                                <Subheading>{view.create.label}</Subheading>
                            </div>
                            <LibraryForm {...view.create} isSaving={view.isSaving} />
                        </section>
                    ) : null}
                </LibraryFormDisclosure>
                <div className={styles.workbench} data-filtered={Boolean(view.filter)}>
                    {view.filter && (
                        <section className={styles.toolbar} aria-label="Filtros">
                            <Subheading><LibraryIcon name="filters" />Filtros</Subheading>
                            <LibraryForm {...view.filter} disabled={view.isSaving} layout="filters" />
                        </section>
                    )}
                    <div className={styles.panel} aria-busy={view.loading}>
                        <header className={styles.results}>
                            <Subheading>Registros</Subheading>
                            {!view.loading && !view.error && <span className={styles.count}>{view.records.length}</span>}
                            {view.filterBadge && <LibraryBadge {...view.filterBadge} />}
                            <LibraryButton className={styles.refresh} disabled={view.loading || view.isSaving} onClick={view.refresh}>
                                <LibraryIcon name="refresh" />Actualizar
                            </LibraryButton>
                        </header>
                        {view.loading ? (
                            <div className={styles.status}>
                                <LibraryStatus>Cargando registros...</LibraryStatus>
                                <LibrarySkeleton />
                            </div>
                        ) : view.error ? (
                            <div className={styles.status}>
                                <LibraryStatus kind="error">{view.error}</LibraryStatus>
                                <LibraryButton disabled={view.isSaving} onClick={view.refresh}>Reintentar</LibraryButton>
                            </div>
                        ) : view.records.length === 0 ? (
                            <div className={styles.empty}><LibraryStatus kind="empty">No hay resultados.</LibraryStatus></div>
                        ) : (
                            <LibraryRecordList records={view.records} detail={view.detail} isSaving={view.isSaving}
                                renderDetailContent={renderDetailContent} />
                        )}
                    </div>
                </div>
            </div>
            {view.confirmation && (
                <dialog className={styles.confirmation} id={view.confirmation.id} onCancel={view.confirmation.cancel}
                    aria-label={view.confirmation.label}>
                    <h2>{view.confirmation.label}</h2>
                    <p>{view.confirmation.message}</p>
                    <div>
                        <LibraryButton autoFocus onClick={view.confirmation.cancel}>Cancelar</LibraryButton>
                        <LibraryButton tone={view.confirmation.tone} onClick={view.confirmation.confirm}>Confirmar</LibraryButton>
                    </div>
                </dialog>
            )}
        </section>
    );
}
