import { EstadoEjemplar } from "@/domain/entities/ejemplar";
import type {Disponibilidad, RecordsView, SolicitudInterbibliotecariaInicial } from "@/core/types";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryRecords } from "@/ui/components/library-records/library-records";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import styles from "./style.module.css";

type Props = {
    records: RecordsView;
    loadingSedes: boolean;
    sedesError: string | null;
    noActiveSedes: boolean;
    retrySedes: () => void;
    disponibilidad: Disponibilidad | null;
    refreshDisponibilidad: () => void;
    sedePropia: string;
    recepcionista: boolean;
    onSolicitarInterbibliotecaria?: (inicial: SolicitudInterbibliotecariaInicial) => void;
};

export default function Ejemplares({
    records,
    loadingSedes,
    sedesError,
    noActiveSedes,
    retrySedes,
    disponibilidad,
    refreshDisponibilidad,
    sedePropia,
    recepcionista,
    onSolicitarInterbibliotecaria
}: Props) {
    const sedesConStock = disponibilidad?.data?.sedes ?? [];

    return (
        <>
            <section
                className={styles.disponibilidad}
                aria-label="Disponibilidad por sede"
            >
                <h3>Disponibilidad por sede</h3>

                {!disponibilidad && (
                    <LibraryStatus>
                        Cargando disponibilidad...
                    </LibraryStatus>
                )}

                {disponibilidad && !disponibilidad.success && (
                    <>
                        <LibraryStatus kind="error">
                            {disponibilidad.error ||
                                "No se pudo consultar la disponibilidad."}
                        </LibraryStatus>

                        <LibraryButton onClick={refreshDisponibilidad}>
                            Reintentar disponibilidad
                        </LibraryButton>
                    </>
                )}

                {disponibilidad?.success && (
                    sedesConStock.length === 0 ? (
                        <LibraryStatus kind="empty">
                            No hay sedes con ejemplares registrados.
                        </LibraryStatus>
                    ) : (
                        <ul>
                            {sedesConStock.map(({
                                sedeId,
                                sedeNombre,
                                sedeActiva,
                                disponibles,
                                ejemplares
                            }) => {
                                const disponibleParaPedir =
                                    sedeActiva &&
                                    disponibles > 0 &&
                                    (
                                        !recepcionista ||
                                        (
                                            Boolean(sedePropia) &&
                                            sedeId !== sedePropia
                                        )
                                    );

                                const primerDisponible =
                                    ejemplares.find(
                                        (ejemplar) =>
                                            ejemplar.estado === EstadoEjemplar.DISPONIBLE
                                    )?.id ?? "";

                                return (
                                    <li key={sedeId}>
                                        <strong>
                                            {sedeNombre ||
                                                (sedeId
                                                    ? `Sede ${sedeId}`
                                                    : "Sin sede asignada")}
                                        </strong>

                                        <span>
                                            {sedeActiva
                                                ? `${disponibles} de ${ejemplares.length} disponibles`
                                                : "Sin préstamos habilitados"}
                                        </span>

                                        {onSolicitarInterbibliotecaria &&
                                            disponibleParaPedir &&
                                            primerDisponible && (
                                                <LibraryButton
                                                    onClick={() =>
                                                        onSolicitarInterbibliotecaria({
                                                            sedeOrigenId: sedeId,
                                                            sedeDestinoId:
                                                                sedePropia !== sedeId
                                                                    ? sedePropia
                                                                    : "",
                                                            ejemplarId: primerDisponible
                                                        })
                                                    }
                                                >
                                                    Solicitar envío
                                                </LibraryButton>
                                            )}
                                    </li>
                                );
                            })}
                        </ul>
                    )
                )}
            </section>

            {loadingSedes && (
                <LibraryStatus>
                    Cargando sedes...
                </LibraryStatus>
            )}

            {sedesError && (
                <div>
                    <LibraryStatus kind="error">
                        {sedesError}
                    </LibraryStatus>

                    <LibraryButton onClick={retrySedes}>
                        Reintentar carga de sedes
                    </LibraryButton>
                </div>
            )}

            {noActiveSedes && (
                <LibraryStatus kind="empty">
                    Necesitás una sede activa para registrar un ejemplar.
                </LibraryStatus>
            )}

            <LibraryRecords
                view={records}
                headingLevel={2}
            />
        </>
    );
}
