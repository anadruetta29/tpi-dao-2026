import type { DeskRow, useViewModel } from "@/ui/routes/bandeja/viewmodel";
import { LibraryBadge } from "@/ui/components/library-badge/library-badge";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryField } from "@/ui/components/library-field/library-field";
import { LibraryForm } from "@/ui/components/library-form/library-form";
import { LibraryFormDisclosure } from "@/ui/components/library-form-disclosure/library-form-disclosure";
import { LibraryIcon } from "@/ui/components/library-icon/library-icon";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import { LibrarySkeleton } from "@/ui/components/library-skeleton/library-skeleton";
import styles from "./style.module.css";

function DeskRows({ rows }: { rows: DeskRow[] }) {
    return (
        <ul className={styles.list}>
            {rows.map(({ id, label, detail, badge, actions }) => (
                <li key={id}>
                    <div><strong>{label}</strong>{detail && <p>{detail}</p>}{badge && <LibraryBadge {...badge} />}</div>
                    <div className={styles.actions}>
                        {actions.map(({ label: text, accessibleLabel, run, loading, tone }) => (
                            <LibraryButton key={text} aria-label={accessibleLabel} tone={tone} loading={loading} onClick={run}>{text}</LibraryButton>
                        ))}
                    </div>
                </li>
            ))}
        </ul>
    );
}

export function Bandeja({ view }: { view: ReturnType<typeof useViewModel> }) {
    return (
        <section className={styles.module}>
            <header className={styles.heading}>
                <span className={styles.emblem}><LibraryIcon name="inbox" /></span>
                <div><h1>Bandeja de trabajo</h1>{view.branchName && <p>{view.branchName}</p>}</div>
            </header>
            <div className={styles.toolbar} role="group" aria-label="Acciones de la bandeja">
                {view.branchField && <LibraryField {...view.branchField} />}
                <LibraryButton className={styles.quickToggle} tone={view.quick ? "secondary" : "primary"}
                    aria-expanded={view.quick} disabled={view.savingQuick} onClick={view.quickToggle}>
                    <LibraryIcon name={view.quick ? "close" : "plus"} />
                    {view.quick ? "Cerrar préstamo rápido" : "Préstamo rápido"}
                </LibraryButton>
                <LibraryButton onClick={view.refresh}><LibraryIcon name="refresh" />Actualizar</LibraryButton>
            </div>
            {view.feedback && <LibraryStatus kind={view.feedback.kind}>{view.feedback.text}</LibraryStatus>}
            {view.error && <LibraryStatus kind="error">{view.error}</LibraryStatus>}
            {view.noBranch ? <LibraryStatus kind="error">Necesitás una sede asignada para usar la bandeja.</LibraryStatus> : (
                <div className={styles.board}>
                    <div className={styles.desk}>
                        <LibraryFormDisclosure>
                            {view.quick ? (
                                <section className={styles.quick} aria-labelledby="prestamo-rapido">
                                    <h2 id="prestamo-rapido">Préstamo rápido de mostrador</h2>
                                    <LibraryForm {...view.quickForm} />
                                </section>
                            ) : null}
                        </LibraryFormDisclosure>
                        <section className={styles.search} aria-labelledby="busqueda-mostrador">
                            <h2 id="busqueda-mostrador"><LibraryIcon name="search" />Búsqueda de mostrador</h2>
                            <LibraryForm {...view.searchForm} layout="filters" />
                            {view.searching && <LibraryStatus>Buscando en mostrador...</LibraryStatus>}
                            {view.searchError && <LibraryStatus kind="error">{view.searchError}</LibraryStatus>}
                            {view.member && (
                                <div className={styles.member}>
                                    <span className={styles.avatar} aria-hidden="true">{view.member.initials}</span>
                                    <div><strong>{view.member.name}</strong><p>{view.member.document}</p></div>
                                    <LibraryBadge {...view.member.badge} />
                                </div>
                            )}
                            {view.searchGroups.map(({ label, tone, rows }) => (
                                <section key={label} className={styles.results} data-tone={tone} aria-label={label}>
                                    <h3>{label}</h3><DeskRows rows={rows} />
                                </section>
                            ))}
                            {view.searchEmpty && <LibraryStatus kind="empty">No hay préstamos pendientes de devolución que coincidan.</LibraryStatus>}
                        </section>
                        {view.notices.length > 0 && (
                            <section className={styles.panel} aria-label="Avisos sin leer">
                                <h2>Avisos sin leer ({view.unreadCount})</h2><DeskRows rows={view.notices} />
                            </section>
                        )}
                    </div>
                    <section className={styles.queue} aria-labelledby="bandeja-pendientes">
                        <header><LibraryIcon name="clipboard" /><h2 id="bandeja-pendientes">Pendientes</h2></header>
                        {view.queue ? (
                            <div className={styles.groups}>
                                {view.queue.map(({ label, error, rows }) => (
                                    <section className={styles.panel} key={label} aria-label={label}>
                                        <h3>{label}{!error && <span>{rows.length}</span>}</h3>
                                        {error ? <LibraryStatus kind="error">{error}</LibraryStatus>
                                            : rows.length ? <DeskRows rows={rows} />
                                                : <LibraryStatus kind="empty">Sin pendientes.</LibraryStatus>}
                                    </section>
                                ))}
                            </div>
                        ) : <><LibraryStatus>Cargando pendientes...</LibraryStatus><LibrarySkeleton /></>}
                    </section>
                </div>
            )}
        </section>
    );
}
