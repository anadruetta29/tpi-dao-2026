import { type Session } from "@/domain/entities/session";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import { useEjemplaresViewModel } from "./ejemplares-viewmodel";
import styles from "./style.module.css";

export function LibroEjemplares({ session, libroId }: { session: Session; libroId: string }) {
    const { records, loadingSedes, sedesError, noActiveSedes, retrySedes, disponibilidad, refreshDisponibilidad } =
        useEjemplaresViewModel(session, libroId);
    const sedesConStock = disponibilidad?.data?.sedes ?? [];
    return (
        <>
            <section className={styles.disponibilidad} aria-label="Disponibilidad por sede">
                <h3>Disponibilidad por sede</h3>
                {!disponibilidad && <LibraryStatus>Cargando disponibilidad...</LibraryStatus>}
                {disponibilidad && !disponibilidad.success && (
                    <>
                        <LibraryStatus kind="error">{disponibilidad.error || "No se pudo consultar la disponibilidad."}</LibraryStatus>
                        <LibraryButton onClick={refreshDisponibilidad}>Reintentar disponibilidad</LibraryButton>
                    </>
                )}
                {disponibilidad?.success && (sedesConStock.length === 0
                    ? <LibraryStatus kind="empty">No hay sedes con ejemplares registrados.</LibraryStatus>
                    : <ul>
                        {sedesConStock.map(({ sedeId, sedeNombre, sedeActiva, disponibles, ejemplares }) => (
                            <li key={sedeId}>
                                <strong>{sedeNombre || (sedeId ? `Sede ${sedeId}` : "Sin sede asignada")}</strong>
                                <span>{sedeActiva ? `${disponibles} de ${ejemplares.length} disponibles` : "Sin préstamos habilitados"}</span>
                            </li>
                        ))}
                    </ul>)}
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
