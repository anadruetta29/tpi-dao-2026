import { ModalidadPrestamoLocal } from "@/domain/entities/modalidad-prestamo-local";
import { type Session } from "@/domain/entities/session";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryField } from "@/ui/components/library-field/library-field";
import { LibraryForm } from "@/ui/components/library-form/library-form";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import { readForm } from "@/ui/forms/handlers/read-form";
import { useViewModel, type DestinoBandeja } from "./viewmodel";
import styles from "./style.module.css";

export function BandejaRoute({ session, onOpen, onDevolver }: {
    session: Session;
    onOpen: (destino: DestinoBandeja) => void;
    onDevolver: (prestamoId: string) => void;
}) {
    const view = useViewModel(session);
    const sedeNames = new Map((view.sedes?.data ?? []).map(({ id, nombre }) => [id, nombre]));
    const sedeLabel = (id: string) => sedeNames.get(id) || `Sede #${id}`;
    const sedeOptions = [
        { value: "", label: "Todas las sedes" },
        ...(view.sedes?.data ?? []).map(({ id, nombre }) => ({ value: id, label: nombre }))
    ];

    return (
        <section className={styles.module}>
            <header className={styles.heading}>
                <div>
                    <h1>Bandeja de trabajo</h1>
                    {view.recepcionista && view.sedeId && <p>{view.sedeNombre || `Sede #${view.sedeId}`}</p>}
                </div>
                <div className={styles.toolbar}>
                    {!view.recepcionista && (
                        <LibraryField name="sede" label="Sede" options={sedeOptions} onChange={view.buscarEnSede} />
                    )}
                    <LibraryButton onClick={view.togglePrestamoRapido}>
                        {view.prestamoRapidoAbierto ? "Cerrar préstamo rápido" : "Préstamo rápido"}
                    </LibraryButton>
                    <LibraryButton onClick={view.refresh}>Actualizar</LibraryButton>
                </div>
            </header>

            {view.feedback && (
                <LibraryStatus kind={view.feedback.success ? "success" : "error"}>
                    {view.feedback.success
                        ? (view.feedback.message || "Operación realizada correctamente.")
                        : (view.feedback.error || "No se pudo completar la operación.")}
                </LibraryStatus>
            )}

            {view.sedes && !view.sedes.success && !view.recepcionista && (
                <LibraryStatus kind="error">{view.sedes.error || "No se pudieron cargar las sedes."}</LibraryStatus>
            )}

            {view.recepcionista && !view.sedeId ? (
                <LibraryStatus kind="error">Necesitás una sede asignada para usar la bandeja.</LibraryStatus>
            ) : (
                <>
                    {view.prestamoRapidoAbierto && (
                        <section className={styles.panel} aria-labelledby="prestamo-rapido">
                            <h2 id="prestamo-rapido">Préstamo rápido de mostrador</h2>
                            <LibraryForm
                                label="Prestar ahora"
                                fields={[
                                    ...(!view.sedeId ? [{ name: "sedeOrigenId", label: "Sede", options: (view.sedes?.data ?? []).map(({ id, nombre }) => ({ value: id, label: nombre })) }] : []),
                                    view.socioField,
                                    view.ejemplaresField,
                                    { name: "modalidad", label: "Modalidad", options: ModalidadPrestamoLocal.toOptions() }
                                ]}
                                onSubmit={(event) => readForm(event, view.prestarRapido)}
                            />
                        </section>
                    )}

                    <section className={styles.panel} aria-labelledby="busqueda-mostrador">
                        <h2 id="busqueda-mostrador">Búsqueda de mostrador</h2>
                        <LibraryForm label="Buscar préstamo" layout="filters" fields={[
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
                            { name: "valor", label: "Dato de búsqueda", placeholder: "DNI, código de ejemplar o #préstamo", required: true }
                        ]} onSubmit={(event) => readForm(event, view.buscar)} />
                        {view.buscando && <LibraryStatus>Buscando en mostrador...</LibraryStatus>}
                        {view.mostrador && (!view.mostrador.success ? (
                            <LibraryStatus kind="error">{view.mostrador.error || "No se pudo realizar la búsqueda."}</LibraryStatus>
                        ) : view.mostrador.data && (
                            <>
                                {view.mostrador.data.socio && (
                                    <p>
                                        <strong>{view.mostrador.data.socio.nombre} {view.mostrador.data.socio.apellido}</strong>
                                        {" · "}DNI {view.mostrador.data.socio.documento}
                                        {" · "}{view.mostrador.data.socio.estadoName}
                                    </p>
                                )}

                                {view.mostrador.data.multasPendientes.length > 0 && (
                                    <ul className={styles.list}>
                                        {view.mostrador.data.multasPendientes.map((multa) => (
                                            <li key={`multa-${multa.id}`}>
                                                <div>
                                                    <strong>Multa pendiente #{multa.id} · ${multa.monto}</strong>
                                                    <span>{multa.motivoName} · Préstamo #{multa.prestamoId}</span>
                                                </div>
                                                <LibraryButton
                                                    tone="primary"
                                                    disabled={view.busyId === `multa-${multa.id}`}
                                                    onClick={() => view.pagarMultaRapido(multa.id)}
                                                >
                                                    Registrar pago
                                                </LibraryButton>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {view.mostrador.data.reservasListas.length > 0 && (
                                    <ul className={styles.list}>
                                        {view.mostrador.data.reservasListas.map((reserva) => (
                                            <li key={`res-${reserva.id}`}>
                                                <div>
                                                    <strong>Reserva lista #{reserva.id}</strong>
                                                    <span>Ejemplar #{reserva.ejemplarId}{reserva.fechaLimiteRetiro ? ` · Retiro hasta ${String(reserva.fechaLimiteRetiro).slice(0, 10)}` : ""}</span>
                                                </div>
                                                <div className={styles.actions}>
                                                    <LibraryButton onClick={() => onOpen({ modulo: "Reservas", id: reserva.id })}>Ver reserva</LibraryButton>
                                                    <LibraryButton
                                                        tone="primary"
                                                        disabled={view.busyId === `reserva-${reserva.id}`}
                                                        onClick={() => view.entregarReservaRapido(reserva.id)}
                                                    >
                                                        Entregar
                                                    </LibraryButton>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {view.mostrador.data.prestamos.length > 0 ? (
                                    <ul className={styles.list}>
                                        {view.mostrador.data.prestamos.map((prestamo) => {
                                            const pendientes = prestamo.ejemplaresIds.filter((id) => !prestamo.ejemplaresDevueltosIds.includes(id));
                                            const ejemplarDirecto = view.mostrador?.data?.ejemplarIdBuscado
                                                ?? (pendientes.length <= 1 ? pendientes[0] : undefined);
                                            return (
                                                <li key={prestamo.id}>
                                                    <div>
                                                        <strong>Préstamo #{prestamo.id}</strong>
                                                        <span>{prestamo.estadoName}{prestamo.sedeId && ` · ${sedeLabel(prestamo.sedeId)}`}</span>
                                                    </div>
                                                    <div className={styles.actions}>
                                                        <LibraryButton onClick={() => onOpen({ modulo: "Préstamos", id: prestamo.id })}>Ver préstamo</LibraryButton>
                                                        {(pendientes.length <= 1 || Boolean(view.mostrador?.data?.ejemplarIdBuscado)) && (
                                                            <LibraryButton
                                                                tone="primary"
                                                                disabled={view.busyId === `devolver-${prestamo.id}-${ejemplarDirecto ?? "all"}`}
                                                                onClick={() => view.devolverRapido(prestamo.id, ejemplarDirecto)}
                                                            >
                                                                Devolver hoy
                                                            </LibraryButton>
                                                        )}
                                                        <LibraryButton onClick={() => onDevolver(prestamo.id)}>Registrar devolución</LibraryButton>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : !view.mostrador.data.multasPendientes.length && !view.mostrador.data.reservasListas.length ? (
                                    <LibraryStatus kind="empty">No hay préstamos pendientes de devolución que coincidan.</LibraryStatus>
                                ) : null}
                            </>
                        ))}
                    </section>

                    {view.avisosSinLeer?.success && (view.avisosSinLeer.data?.length ?? 0) > 0 && (
                        <section className={styles.panel} aria-label="Avisos sin leer">
                            <h2>Avisos sin leer ({view.avisosSinLeer.data?.length})</h2>
                            <ul className={styles.list}>
                                {(view.avisosSinLeer.data ?? []).slice(0, 5).map((aviso) => (
                                    <li key={aviso.id}>
                                        <div>
                                            <strong>{aviso.tipoName}</strong>
                                            <span>{aviso.mensaje}</span>
                                        </div>
                                        <div className={styles.actions}>
                                            {aviso.reservaId && (
                                                <LibraryButton onClick={() => onOpen({ modulo: "Reservas", id: aviso.reservaId })}>Ver reserva</LibraryButton>
                                            )}
                                            {aviso.prestamoId && (
                                                <LibraryButton onClick={() => onOpen({ modulo: "Préstamos", id: aviso.prestamoId })}>Ver préstamo</LibraryButton>
                                            )}
                                            <LibraryButton
                                                disabled={view.busyId === `aviso-${aviso.id}`}
                                                onClick={() => view.marcarAvisoLeido(aviso.id)}
                                            >
                                                Marcar leído
                                            </LibraryButton>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {view.grupos ? (
                        <div className={styles.groups}>
                            {view.grupos.map(({ titulo, items }) => (
                                <section className={styles.panel} key={titulo} aria-label={titulo}>
                                    <h2>{titulo}</h2>
                                    {!items.success ? (
                                        <LibraryStatus kind="error">{items.error || "No se pudieron cargar los pendientes."}</LibraryStatus>
                                    ) : items.data?.length ? (
                                        <ul className={styles.list}>
                                            {items.data.map((item) => (
                                                <li key={`${item.modulo}-${item.id}`}>
                                                    <div>
                                                        <strong>{item.label}</strong>
                                                        <span>{item.detalle}{!view.sedeId && item.sedeId && ` · ${sedeLabel(item.sedeId)}`}</span>
                                                    </div>
                                                    <div className={styles.actions}>
                                                        {item.accion && (
                                                            <LibraryButton
                                                                tone={item.accion.tone}
                                                                disabled={view.busyId === `${titulo}-${item.id}`}
                                                                onClick={() => view.ejecutarAccion(`${titulo}-${item.id}`, item.accion!.execute)}
                                                            >
                                                                {item.accion.label}
                                                            </LibraryButton>
                                                        )}
                                                        <LibraryButton aria-label={`Abrir ${item.label}`} onClick={() => onOpen(item)}>Abrir</LibraryButton>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <LibraryStatus kind="empty">Sin pendientes.</LibraryStatus>}
                                </section>
                            ))}
                        </div>
                    ) : <LibraryStatus>Cargando pendientes...</LibraryStatus>}
                </>
            )}
        </section>
    );
}
