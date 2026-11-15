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
                    <LibraryButton onClick={view.refresh}>Actualizar</LibraryButton>
                </div>
            </header>
            {view.sedes && !view.sedes.success && !view.recepcionista && (
                <LibraryStatus kind="error">{view.sedes.error || "No se pudieron cargar las sedes."}</LibraryStatus>
            )}
            {view.recepcionista && !view.sedeId ? (
                <LibraryStatus kind="error">Necesitás una sede asignada para usar la bandeja.</LibraryStatus>
            ) : (
                <>
                    <section className={styles.panel} aria-labelledby="busqueda-mostrador">
                        <h2 id="busqueda-mostrador">Búsqueda de mostrador</h2>
                        <LibraryForm label="Buscar préstamo" layout="filters" fields={[
                            {
                                name: "criterio",
                                label: "Buscar por",
                                options: [
                                    { value: "dni", label: "DNI del socio" },
                                    { value: "codigo", label: "Código de ejemplar" },
                                    { value: "prestamo", label: "Número de préstamo" }
                                ]
                            },
                            { name: "valor", label: "Dato de búsqueda", placeholder: "Ingresá o escaneá el dato", required: true }
                        ]} onSubmit={(event) => readForm(event, view.buscar)} />
                        {view.buscando && <LibraryStatus>Buscando préstamos...</LibraryStatus>}
                        {view.prestamos && (!view.prestamos.success ? (
                            <LibraryStatus kind="error">{view.prestamos.error || "No se pudo realizar la búsqueda."}</LibraryStatus>
                        ) : view.prestamos.data?.length ? (
                            <ul className={styles.list}>
                                {view.prestamos.data.map((prestamo) => (
                                    <li key={prestamo.id}>
                                        <div>
                                            <strong>Préstamo #{prestamo.id}</strong>
                                            <span>{prestamo.estadoName}{prestamo.sedeId && ` · ${sedeLabel(prestamo.sedeId)}`}</span>
                                        </div>
                                        <div className={styles.actions}>
                                            <LibraryButton onClick={() => onOpen({ modulo: "Préstamos", id: prestamo.id })}>Ver préstamo</LibraryButton>
                                            <LibraryButton tone="primary" onClick={() => onDevolver(prestamo.id)}>Registrar devolución</LibraryButton>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <LibraryStatus kind="empty">No hay préstamos pendientes de devolución que coincidan.</LibraryStatus>)}
                    </section>
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
                                                <li key={item.id}>
                                                    <div>
                                                        <strong>{item.label}</strong>
                                                        <span>{item.detalle}{!view.sedeId && item.sedeId && ` · ${sedeLabel(item.sedeId)}`}</span>
                                                    </div>
                                                    <LibraryButton aria-label={`Abrir ${item.label}`} onClick={() => onOpen(item)}>Abrir</LibraryButton>
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
