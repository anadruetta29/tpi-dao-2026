import type { ActionState, DestinoBandeja, Grupo } from "@/core/types";
import type { Aviso } from "@/domain/entities/aviso";
import type { Sede } from "@/domain/entities/sede";
import { ModalidadPrestamoLocal } from "@/domain/entities/modalidad-prestamo-local";
import type { MostradorResultado } from "@/ui/actions/mostrador/mostrador.actions";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryField } from "@/ui/components/library-field/library-field";
import { LibraryForm } from "@/ui/components/library-form/library-form";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import { readForm, type ReadField, type ReadFieldValues } from "@/ui/forms/handlers/read-form";
import type { Field } from "@/ui/routes/use-library-records-viewmodel";
import styles from "./style.module.css";

type Props = {
    recepcionista: boolean;
    sedes: ActionState<Sede[]> | null;
    buscarEnSede: (id: string) => void;
    togglePrestamoRapido: () => void;
    refresh: () => void;
    feedback: ActionState<unknown> | null;
    sedeId: string;
    sedeNombre?: string;
    socioField: Field;
    ejemplaresField: Field;
    buscar: (field: ReadField) => void;
    buscando: boolean;
    mostrador: ActionState<MostradorResultado> | null;
    busyId: string | null;
    pagarMultaRapido: (multaId: string) => void;
    entregarReservaRapido: (reservaId: string) => void;
    prestamoRapidoAbierto: boolean;
    avisosSinLeer: ActionState<Aviso[]> | null;
    marcarAvisoLeido: (avisoId: string) => void;
    grupos: Grupo[] | null;
    ejecutarAccion: ( key: string, fn: () => Promise<ActionState<unknown>> ) => void;
    prestarRapido: ( field: ReadField, values: ReadFieldValues ) => Promise<ActionState<unknown>>;
    devolverRapido: (prestamoId: string, ejemplarId?: string) => void;
    onOpen: (destino: DestinoBandeja) => void;
    onDevolver: (prestamoId: string) => void;
};

export function Bandeja({
    recepcionista,
    sedes,
    buscarEnSede,
    togglePrestamoRapido,
    refresh,
    feedback,
    sedeId,
    sedeNombre,
    socioField,
    ejemplaresField,
    buscar,
    buscando,
    mostrador,
    busyId,
    pagarMultaRapido,
    entregarReservaRapido,
    prestamoRapidoAbierto,
    avisosSinLeer,
    marcarAvisoLeido,
    grupos,
    ejecutarAccion,
    prestarRapido,
    devolverRapido,
    onOpen,
    onDevolver
}: Props) {
    const sedeNames = new Map(
        (sedes?.data ?? []).map(({ id, nombre }) => [id, nombre])
    );

    const sedeLabel = (id: string) =>
        sedeNames.get(id) || `Sede #${id}`;

    const sedeOptions = [
        { value: "", label: "Todas las sedes" },
        ...(sedes?.data ?? []).map(({ id, nombre }) => ({
            value: id,
            label: nombre
        }))
    ];

    return (
        <section className={styles.module}>
            <header className={styles.heading}>
                <div>
                    <h1>Bandeja de trabajo</h1>
                    {recepcionista && sedeId && (
                        <p>{sedeNombre || `Sede #${sedeId}`}</p>
                    )}
                </div>

                <div className={styles.toolbar}>
                    {!recepcionista && (
                        <LibraryField
                            name="sede"
                            label="Sede"
                            options={sedeOptions}
                            onChange={buscarEnSede}
                        />
                    )}

                    <LibraryButton onClick={togglePrestamoRapido}>
                        {prestamoRapidoAbierto
                            ? "Cerrar préstamo rápido"
                            : "Préstamo rápido"}
                    </LibraryButton>

                    <LibraryButton onClick={refresh}>
                        Actualizar
                    </LibraryButton>
                </div>
            </header>

            {feedback && (
                <LibraryStatus kind={feedback.success ? "success" : "error"}>
                    {feedback.success
                        ? feedback.message || "Operación realizada correctamente."
                        : feedback.error || "No se pudo completar la operación."}
                </LibraryStatus>
            )}

            {sedes && !sedes.success && !recepcionista && (
                <LibraryStatus kind="error">
                    {sedes.error || "No se pudieron cargar las sedes."}
                </LibraryStatus>
            )}

            {recepcionista && !sedeId ? (
                <LibraryStatus kind="error">
                    Necesitás una sede asignada para usar la bandeja.
                </LibraryStatus>
            ) : (
                <>
                    {prestamoRapidoAbierto && (
                        <section
                            className={styles.panel}
                            aria-labelledby="prestamo-rapido"
                        >
                            <h2 id="prestamo-rapido">
                                Préstamo rápido de mostrador
                            </h2>

                            <LibraryForm
                                label="Prestar ahora"
                                fields={[
                                    ...(!sedeId
                                        ? [{
                                            name: "sedeOrigenId",
                                            label: "Sede",
                                            options: (sedes?.data ?? []).map(
                                                ({ id, nombre }) => ({
                                                    value: id,
                                                    label: nombre
                                                })
                                            )
                                        }]
                                        : []),
                                    socioField,
                                    ejemplaresField,
                                    {
                                        name: "modalidad",
                                        label: "Modalidad",
                                        options: ModalidadPrestamoLocal.toOptions()
                                    }
                                ]}
                                onSubmit={(event) => readForm(event, prestarRapido)}
                            />
                        </section>
                    )}

                    <section
                        className={styles.panel}
                        aria-labelledby="busqueda-mostrador"
                    >
                        <h2 id="busqueda-mostrador">
                            Búsqueda de mostrador
                        </h2>

                        <LibraryForm
                            label="Buscar préstamo"
                            layout="filters"
                            fields={[
                                {
                                    name: "criterio",
                                    label: "Buscar por",
                                    options: [
                                        { value: "auto", label: "Detectar automáticamente" },
                                        { value: "dni", label: "DNI del socio" },
                                        { value: "codigo", label: "Código de ejemplar" },
                                        { value: "prestamo", label: "Número de préstamo" }
                                    ]
                                },
                                {
                                    name: "valor",
                                    label: "Dato de búsqueda",
                                    placeholder: "DNI, código de ejemplar o #préstamo",
                                    required: true
                                }
                            ]}
                            onSubmit={(event) => readForm(event, buscar)}
                        />

                        {buscando && (
                            <LibraryStatus>
                                Buscando en mostrador...
                            </LibraryStatus>
                        )}

                        {mostrador && (
                            !mostrador.success ? (
                                <LibraryStatus kind="error">
                                    {mostrador.error || "No se pudo realizar la búsqueda."}
                                </LibraryStatus>
                            ) : mostrador.data && (
                                <>
                                    {mostrador.data.socio && (
                                        <p>
                                            <strong>
                                                {mostrador.data.socio.nombre}{" "}
                                                {mostrador.data.socio.apellido}
                                            </strong>
                                            {" · "}DNI {mostrador.data.socio.documento}
                                            {" · "}{mostrador.data.socio.estadoName}
                                        </p>
                                    )}

                                    {mostrador.data.multasPendientes.length > 0 && (
                                        <ul className={styles.list}>
                                            {mostrador.data.multasPendientes.map((multa) => (
                                                <li key={`multa-${multa.id}`}>
                                                    <div>
                                                        <strong>
                                                            Multa pendiente #{multa.id} · ${multa.monto}
                                                        </strong>
                                                        <span>
                                                            {multa.motivoName} · Préstamo #{multa.prestamoId}
                                                        </span>
                                                    </div>

                                                    <LibraryButton
                                                        tone="primary"
                                                        disabled={busyId === `multa-${multa.id}`}
                                                        onClick={() => pagarMultaRapido(multa.id)}
                                                    >
                                                        Registrar pago
                                                    </LibraryButton>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {mostrador.data.reservasListas.length > 0 && (
                                        <ul className={styles.list}>
                                            {mostrador.data.reservasListas.map((reserva) => (
                                                <li key={`res-${reserva.id}`}>
                                                    <div>
                                                        <strong>
                                                            Reserva lista #{reserva.id}
                                                        </strong>
                                                        <span>
                                                            Ejemplar #{reserva.ejemplarId}
                                                            {reserva.fechaLimiteRetiro
                                                                ? ` · Retiro hasta ${String(reserva.fechaLimiteRetiro).slice(0, 10)}`
                                                                : ""}
                                                        </span>
                                                    </div>

                                                    <div className={styles.actions}>
                                                        <LibraryButton
                                                            onClick={() =>
                                                                onOpen({
                                                                    modulo: "Reservas",
                                                                    id: reserva.id
                                                                })
                                                            }
                                                        >
                                                            Ver reserva
                                                        </LibraryButton>

                                                        <LibraryButton
                                                            tone="primary"
                                                            disabled={busyId === `reserva-${reserva.id}`}
                                                            onClick={() => entregarReservaRapido(reserva.id)}
                                                        >
                                                            Entregar
                                                        </LibraryButton>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {mostrador.data.prestamos.length > 0 ? (
                                        <ul className={styles.list}>
                                            {mostrador.data.prestamos.map((prestamo) => {
                                                const pendientes = prestamo.ejemplaresIds.filter(
                                                    (id) => !prestamo.ejemplaresDevueltosIds.includes(id)
                                                );

                                                const ejemplarDirecto =
                                                    mostrador.data?.ejemplarIdBuscado ??
                                                    (pendientes.length <= 1 ? pendientes[0] : undefined);

                                                return (
                                                    <li key={prestamo.id}>
                                                        <div>
                                                            <strong>
                                                                Préstamo #{prestamo.id}
                                                            </strong>
                                                            <span>
                                                                {prestamo.estadoName}
                                                                {prestamo.sedeId &&
                                                                    ` · ${sedeLabel(prestamo.sedeId)}`}
                                                            </span>
                                                        </div>

                                                        <div className={styles.actions}>
                                                            <LibraryButton
                                                                onClick={() =>
                                                                    onOpen({
                                                                        modulo: "Préstamos",
                                                                        id: prestamo.id
                                                                    })
                                                                }
                                                            >
                                                                Ver préstamo
                                                            </LibraryButton>

                                                            {(pendientes.length <= 1 ||
                                                                Boolean(mostrador.data?.ejemplarIdBuscado)) && (
                                                                <LibraryButton
                                                                    tone="primary"
                                                                    disabled={
                                                                        busyId ===
                                                                        `devolver-${prestamo.id}-${ejemplarDirecto ?? "all"}`
                                                                    }
                                                                    onClick={() =>
                                                                        devolverRapido(prestamo.id, ejemplarDirecto)
                                                                    }
                                                                >
                                                                    Devolver hoy
                                                                </LibraryButton>
                                                            )}

                                                            <LibraryButton
                                                                onClick={() => onDevolver(prestamo.id)}
                                                            >
                                                                Registrar devolución
                                                            </LibraryButton>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        !mostrador.data.multasPendientes.length &&
                                        !mostrador.data.reservasListas.length && (
                                            <LibraryStatus kind="empty">
                                                No hay préstamos pendientes de devolución que coincidan.
                                            </LibraryStatus>
                                        )
                                    )}
                                </>
                            )
                        )}
                    </section>

                    {avisosSinLeer?.success &&
                        (avisosSinLeer.data?.length ?? 0) > 0 && (
                            <section
                                className={styles.panel}
                                aria-label="Avisos sin leer"
                            >
                                <h2>
                                    Avisos sin leer ({avisosSinLeer.data?.length})
                                </h2>

                                <ul className={styles.list}>
                                    {(avisosSinLeer.data ?? []).slice(0, 5).map((aviso) => (
                                        <li key={aviso.id}>
                                            <div>
                                                <strong>{aviso.tipoName}</strong>
                                                <span>{aviso.mensaje}</span>
                                            </div>

                                            <div className={styles.actions}>
                                                {aviso.reservaId && (
                                                    <LibraryButton
                                                        onClick={() =>
                                                            onOpen({
                                                                modulo: "Reservas",
                                                                id: aviso.reservaId!
                                                            })
                                                        }
                                                    >
                                                        Ver reserva
                                                    </LibraryButton>
                                                )}

                                                {aviso.prestamoId && (
                                                    <LibraryButton
                                                        onClick={() =>
                                                            onOpen({
                                                                modulo: "Préstamos",
                                                                id: aviso.prestamoId!
                                                            })
                                                        }
                                                    >
                                                        Ver préstamo
                                                    </LibraryButton>
                                                )}

                                                <LibraryButton
                                                    disabled={busyId === `aviso-${aviso.id}`}
                                                    onClick={() => marcarAvisoLeido(aviso.id)}
                                                >
                                                    Marcar leído
                                                </LibraryButton>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                    {grupos ? (
                        <div className={styles.groups}>
                            {grupos.map(({ titulo, items }) => (
                                <section
                                    className={styles.panel}
                                    key={titulo}
                                    aria-label={titulo}
                                >
                                    <h2>{titulo}</h2>

                                    {!items.success ? (
                                        <LibraryStatus kind="error">
                                            {items.error || "No se pudieron cargar los pendientes."}
                                        </LibraryStatus>
                                    ) : items.data?.length ? (
                                        <ul className={styles.list}>
                                            {items.data.map((item) => (
                                                <li key={`${item.modulo}-${item.id}`}>
                                                    <div>
                                                        <strong>{item.label}</strong>
                                                        <span>
                                                            {item.detalle}
                                                            {!sedeId && item.sedeId &&
                                                                ` · ${sedeLabel(item.sedeId)}`}
                                                        </span>
                                                    </div>

                                                    <div className={styles.actions}>
                                                        {item.accion && (
                                                            <LibraryButton
                                                                tone={item.accion.tone}
                                                                disabled={
                                                                    busyId === `${titulo}-${item.id}`
                                                                }
                                                                onClick={() =>
                                                                    ejecutarAccion(
                                                                        `${titulo}-${item.id}`,
                                                                        item.accion!.execute
                                                                    )
                                                                }
                                                            >
                                                                {item.accion.label}
                                                            </LibraryButton>
                                                        )}

                                                        <LibraryButton
                                                            aria-label={`Abrir ${item.label}`}
                                                            onClick={() => onOpen(item)}
                                                        >
                                                            Abrir
                                                        </LibraryButton>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <LibraryStatus kind="empty">
                                            Sin pendientes.
                                        </LibraryStatus>
                                    )}
                                </section>
                            ))}
                        </div>
                    ) : (
                        <LibraryStatus>
                            Cargando pendientes...
                        </LibraryStatus>
                    )}
                </>
            )}
        </section>
    );
}
