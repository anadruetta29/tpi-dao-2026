import type ViewModel from "@/ui/routes/ejemplares/viewmodel";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryIcon } from "@/ui/components/library-icon/library-icon";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import styles from "./style.module.css";

export default function Ejemplares({
    records, loadingSedes, sedesError, noActiveSedes, retrySedes, disponibilidad, refreshDisponibilidad, stock
}: ReturnType<typeof ViewModel>) {
    return (
        <>
            <section className={styles.disponibilidad} aria-label="Disponibilidad por sede">
                <h3><LibraryIcon name="shelf" />Disponibilidad por sede</h3>
                {!disponibilidad && <LibraryStatus>Cargando disponibilidad...</LibraryStatus>}
                {disponibilidad && !disponibilidad.success && (
                    <>
                        <LibraryStatus kind="error">{disponibilidad.error || "No se pudo consultar la disponibilidad."}</LibraryStatus>
                        <LibraryButton onClick={refreshDisponibilidad}>Reintentar disponibilidad</LibraryButton>
                    </>
                )}
                {disponibilidad?.success && (stock.length ? (
                    <ul>
                        {stock.map(({ id, label, summary, meterLabel, local, tone, total, available, request }) => (
                            <li key={id} data-tone={tone} data-local={local}>
                                <strong>{label}</strong>
                                {local && <small>Tu sede</small>}
                                <span>{summary}</span>
                                <meter min={0} max={total} value={available} aria-label={meterLabel} />
                                {request && <LibraryButton onClick={request}>Solicitar envío</LibraryButton>}
                            </li>
                        ))}
                    </ul>
                ) : <LibraryStatus kind="empty">No hay sedes con ejemplares registrados.</LibraryStatus>)}
            </section>
            {loadingSedes && <LibraryStatus>Cargando sedes...</LibraryStatus>}
            {sedesError && (
                <div>
                    <LibraryStatus kind="error">{sedesError}</LibraryStatus>
                    <LibraryButton onClick={retrySedes}>Reintentar carga de sedes</LibraryButton>
                </div>
            )}
            {noActiveSedes && <LibraryStatus kind="empty">Necesitás una sede activa para registrar un ejemplar.</LibraryStatus>}
            <LibraryRecords view={records} headingLevel={2} />
        </>
    );
}
