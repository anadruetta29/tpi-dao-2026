import { EstadoEjemplar } from "@/domain/entities/ejemplar";
import { Rol } from "@/domain/entities/rol";
import { type Session } from "@/domain/entities/session";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import { useEjemplaresViewModel } from "./ejemplares-viewmodel";
import styles from "./style.module.css";

export type SolicitudInterbibliotecariaInicial = {
    sedeOrigenId: string;
    sedeDestinoId: string;
    ejemplarId: string;
};

export function LibroEjemplares({ session, libroId, onSolicitarInterbibliotecaria }: {
    session: Session;
    libroId: string;
    onSolicitarInterbibliotecaria?: (inicial: SolicitudInterbibliotecariaInicial) => void;
}) {
    const { records, loadingSedes, sedesError, noActiveSedes, retrySedes, disponibilidad, refreshDisponibilidad } =
        useEjemplaresViewModel(session, libroId);
    const sedesConStock = disponibilidad?.data?.sedes ?? [];
    const sedePropia = session.user?.sedeId ?? "";
    const recepcionista = session.user?.roleEntity === Rol.RECEPCIONISTA;
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
                        {sedesConStock.map(({ sedeId, sedeNombre, sedeActiva, disponibles, ejemplares }) => {
                            const disponibleParaPedir = sedeActiva && disponibles > 0
                                && (!recepcionista || (Boolean(sedePropia) && sedeId !== sedePropia));
                            const primerDisponible = ejemplares.find((e) => e.estado === EstadoEjemplar.DISPONIBLE)?.id ?? "";
                            return (
                                <li key={sedeId}>
                                    <strong>{sedeNombre || (sedeId ? `Sede ${sedeId}` : "Sin sede asignada")}</strong>
                                    <span>{sedeActiva ? `${disponibles} de ${ejemplares.length} disponibles` : "Sin préstamos habilitados"}</span>
                                    {onSolicitarInterbibliotecaria && disponibleParaPedir && primerDisponible && (
                                        <LibraryButton
                                            onClick={() => onSolicitarInterbibliotecaria({
                                                sedeOrigenId: sedeId,
                                                sedeDestinoId: sedePropia !== sedeId ? sedePropia : "",
                                                ejemplarId: primerDisponible
                                            })}
                                        >
                                            Solicitar envío
                                        </LibraryButton>
                                    )}
                                </li>
                            );
                        })}
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
