import type { useViewModel } from "@/ui/routes/reportes/viewmodel";
import { LibraryBadge } from "@/ui/components/library-badge/library-badge";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryField } from "@/ui/components/library-field/library-field";
import { LibraryIcon } from "@/ui/components/library-icon/library-icon";
import { LibrarySkeleton } from "@/ui/components/library-skeleton/library-skeleton";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import { statusBadge } from "@/ui/components/library-records/viewmodel";
import styles from "./style.module.css";

function formatMoney(value: number): string {
    return `$${value.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function Reportes({ view }: { view: ReturnType<typeof useViewModel> }) {
    return (
        <section className={styles.module}>
            <header className={styles.heading}>
                <span className={styles.emblem}><LibraryIcon name="chartBar" /></span>
                <div>
                    <h1>Reportes</h1>
                    <p>{view.currentTab.description}</p>
                </div>
            </header>

            <nav className={styles.tabs} role="tablist" aria-label="Tipos de reporte">
                {view.tabs.map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={view.tab === id}
                        className={styles.tab}
                        onClick={() => view.setTab(id)}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            <div className={styles.toolbar} role="group" aria-label="Filtros del reporte">
                {(view.tab === "movimiento" || view.tab === "logistica") && (
                    <>
                        <div className={styles.toolbarField}>
                            <LibraryField
                                key={`${view.filterRevision}-fechaDesde`}
                                name="fechaDesde"
                                label="Desde"
                                placeholder="Fecha desde"
                                type="date"
                                max={view.filters.fechaHasta && view.filters.fechaHasta <= view.today ? view.filters.fechaHasta : view.today}
                                defaultValue={view.filters.fechaDesde}
                                onChange={view.filters.setFechaDesde}
                            />
                        </div>
                        <div className={styles.toolbarField}>
                            <LibraryField
                                key={`${view.filterRevision}-fechaHasta`}
                                name="fechaHasta"
                                label="Hasta"
                                placeholder="Fecha hasta"
                                type="date"
                                min={view.filters.fechaDesde || undefined}
                                max={view.today}
                                defaultValue={view.filters.fechaHasta}
                                onChange={view.filters.setFechaHasta}
                            />
                        </div>
                        <div className={styles.toolbarField}>
                            <LibraryField
                                key={`${view.filterRevision}-sedeOrigenId`}
                                name="sedeOrigenId"
                                label="Sede origen"
                                options={view.sedeOptions}
                                defaultValue={view.filters.sedeOrigenId}
                                onChange={view.filters.setSedeOrigenId}
                            />
                        </div>
                    </>
                )}

                {view.tab === "movimiento" && (
                    <div className={styles.toolbarField}>
                        <LibraryField
                            key={`${view.filterRevision}-sedeDestinoId`}
                            name="sedeDestinoId"
                            label="Sede destino"
                            options={view.sedeOptions}
                            defaultValue={view.filters.sedeDestinoId}
                            onChange={view.filters.setSedeDestinoId}
                        />
                    </div>
                )}

                {view.tab === "morosidad" && (
                    <div className={styles.toolbarField}>
                        <LibraryField
                            key={`${view.filterRevision}-sedeMorosidadId`}
                            name="sedeMorosidadId"
                            label="Sede"
                            options={view.sedeOptions}
                            defaultValue={view.filters.sedeMorosidadId}
                            onChange={view.filters.setSedeMorosidadId}
                        />
                    </div>
                )}

                {view.tab === "demanda" && (
                    <div className={styles.toolbarField}>
                        <LibraryField
                            key={`${view.filterRevision}-sedeDestinoDemanda`}
                            name="sedeDestinoDemanda"
                            label="Sede solicitante"
                            options={view.sedeOptions}
                            defaultValue={view.filters.sedeDestinoId}
                            onChange={view.filters.setSedeDestinoId}
                        />
                    </div>
                )}

                <div className={styles.toolbarActions}>
                    {view.hasFilters && (
                        <LibraryButton tone="secondary" onClick={view.clearFilters}>
                            Limpiar
                        </LibraryButton>
                    )}
                    <LibraryButton onClick={view.refresh}>
                        <LibraryIcon name="refresh" />
                        Actualizar
                    </LibraryButton>
                </div>
            </div>

            {view.tab === "movimiento" && <MovimientoView state={view.movimiento} />}
            {view.tab === "logistica" && <LogisticaView state={view.logistica} />}
            {view.tab === "morosidad" && <MorosidadView state={view.morosidad} />}
            {view.tab === "demanda" && <DemandaView state={view.demanda} />}
        </section>
    );
}

function MovimientoView({ state }: { state: ReturnType<typeof useViewModel>["movimiento"] }) {
    if (!state) return <><LibraryStatus>Generando reporte de movimiento...</LibraryStatus><LibrarySkeleton /></>;
    if (!state.success || !state.data) return <LibraryStatus kind="error">{state.error || "No se pudo cargar el reporte."}</LibraryStatus>;
    const report = state.data;

    return (
        <div className={styles.grid}>
            <div className={styles.kpis}>
                <div className={styles.kpi}>
                    <span className={styles.kpiLabel}>Remitos totales</span>
                    <strong className={styles.kpiValue}>{report.totalRemitos}</strong>
                    <span className={styles.kpiHint}>Envíos entre sedes en el período</span>
                </div>
                <div className={styles.kpi} data-tone="active">
                    <span className={styles.kpiLabel}>Ejemplares trasladados</span>
                    <strong className={styles.kpiValue}>{report.totalEjemplaresMovidos}</strong>
                    <span className={styles.kpiHint}>Unidades físicas movilizadas</span>
                </div>
                <div className={styles.kpi} data-tone="success">
                    <span className={styles.kpiLabel}>Tránsito promedio global</span>
                    <strong className={styles.kpiValue}>
                        {report.tiempoPromedioGlobalDias !== null ? `${report.tiempoPromedioGlobalDias} días` : "—"}
                    </strong>
                    <span className={styles.kpiHint}>Desde despacho hasta recepción</span>
                </div>
            </div>

            <section className={styles.panel}>
                <h2>Rutas origen → destino</h2>
                {report.rutas.length === 0 ? (
                    <LibraryStatus kind="empty">No hay movimientos registrados con los filtros seleccionados.</LibraryStatus>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Ruta</th>
                                    <th className={styles.num}>Remitos</th>
                                    <th className={styles.num}>Ejemplares</th>
                                    <th className={styles.num}>Recibidos</th>
                                    <th className={styles.num}>En tránsito</th>
                                    <th className={styles.num}>Promedio (días)</th>
                                    <th className={styles.num}>Mín / Máx</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.rutas.map((ruta) => (
                                    <tr key={`${ruta.sedeOrigenId}-${ruta.sedeDestinoId}`}>
                                        <td>
                                            <strong>{ruta.sedeOrigenNombre}</strong> → {ruta.sedeDestinoNombre}
                                        </td>
                                        <td className={styles.num}>{ruta.cantidadRemitos}</td>
                                        <td className={styles.num}>{ruta.cantidadEjemplares}</td>
                                        <td className={styles.num}>{ruta.remitosRecibidos}</td>
                                        <td className={styles.num}>{ruta.remitosEnTransito}</td>
                                        <td className={styles.num}>
                                            {ruta.tiempoPromedioTransitoDias !== null ? `${ruta.tiempoPromedioTransitoDias} d` : "—"}
                                        </td>
                                        <td className={styles.num}>
                                            {ruta.tiempoMinimoTransitoDias !== null && ruta.tiempoMaximoTransitoDias !== null
                                                ? `${ruta.tiempoMinimoTransitoDias} / ${ruta.tiempoMaximoTransitoDias} d`
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

function LogisticaView({ state }: { state: ReturnType<typeof useViewModel>["logistica"] }) {
    if (!state) return <><LibraryStatus>Generando reporte logístico...</LibraryStatus><LibrarySkeleton /></>;
    if (!state.success || !state.data) return <LibraryStatus kind="error">{state.error || "No se pudo cargar el reporte."}</LibraryStatus>;
    const report = state.data;

    return (
        <div className={styles.grid}>
            <div className={styles.kpis}>
                <div className={styles.kpi}>
                    <span className={styles.kpiLabel}>Total de envíos</span>
                    <strong className={styles.kpiValue}>{report.totalRemitos}</strong>
                    <span className={styles.kpiHint}>{report.remitosFinalizados} finalizados · {report.remitosEnCurso} en curso</span>
                </div>
                <div className={styles.kpi} data-tone="success">
                    <span className={styles.kpiLabel}>Tasa de envíos exitosos</span>
                    <strong className={styles.kpiValue}>{report.tasaExitoPorcentaje}%</strong>
                    <span className={styles.kpiHint}>{report.remitosExitosos} recibidos sin novedad</span>
                </div>
                <div className={styles.kpi} data-tone="danger">
                    <span className={styles.kpiLabel}>Tasa de incidencias</span>
                    <strong className={styles.kpiValue}>{report.tasaIncidenciaPorcentaje}%</strong>
                    <span className={styles.kpiHint}>{report.remitosConIncidencia} remitos con incidencia</span>
                </div>
            </div>

            <div className={`${styles.grid} ${styles.gridTwo}`}>
                <section className={styles.panel}>
                    <h2>Desempeño por sede de origen</h2>
                    {report.porSedeOrigen.length === 0 ? (
                        <LibraryStatus kind="empty">Sin envíos registrados.</LibraryStatus>
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Sede origen</th>
                                        <th className={styles.num}>Envíos</th>
                                        <th className={styles.num}>Exitosos</th>
                                        <th className={styles.num}>Incidencias</th>
                                        <th className={styles.num}>Éxito</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.porSedeOrigen.map((s) => (
                                        <tr key={s.sedeId}>
                                            <td><strong>{s.sedeNombre}</strong></td>
                                            <td className={styles.num}>{s.totalEnvios}</td>
                                            <td className={styles.num}>{s.exitosos}</td>
                                            <td className={styles.num}>{s.conIncidencia}</td>
                                            <td className={styles.num}>
                                                <div>{s.tasaExitoPorcentaje}%</div>
                                                <div className={styles.barTrack}>
                                                    <div
                                                        className={`${styles.barFill} ${styles.barFillSuccess}`}
                                                        style={{ width: `${Math.min(100, s.tasaExitoPorcentaje)}%` }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className={styles.panel}>
                    <h2>Incidencias por tipo de estado</h2>
                    {report.incidenciasPorEstado.length === 0 ? (
                        <LibraryStatus kind="empty">No se registraron ejemplares con incidencias.</LibraryStatus>
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Estado reportado</th>
                                        <th className={styles.num}>Ejemplares</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.incidenciasPorEstado.map((item) => (
                                        <tr key={item.estado}>
                                            <td><LibraryBadge {...statusBadge(item.estadoLabel)} /></td>
                                            <td className={styles.num}><strong>{item.cantidad}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            <section className={styles.panel}>
                <h2>Detalle de incidencias registradas</h2>
                {report.incidenciasRecientes.length === 0 ? (
                    <LibraryStatus kind="empty">No hay incidencias registradas en el período.</LibraryStatus>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Remito</th>
                                    <th>Ruta</th>
                                    <th>Ejemplar</th>
                                    <th>Estado</th>
                                    <th>Observación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.incidenciasRecientes.map((inc, idx) => (
                                    <tr key={`${inc.remitoId}-${inc.ejemplarId}-${idx}`}>
                                        <td><strong>{inc.remitoNumero}</strong></td>
                                        <td>{inc.sedeOrigenNombre} → {inc.sedeDestinoNombre}</td>
                                        <td>{inc.ejemplarCodigo}</td>
                                        <td><LibraryBadge {...statusBadge(inc.estadoLabel)} /></td>
                                        <td className={styles.subtext}>{inc.observacion || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

function MorosidadView({ state }: { state: ReturnType<typeof useViewModel>["morosidad"] }) {
    if (!state) return <><LibraryStatus>Generando reporte de morosidad...</LibraryStatus><LibrarySkeleton /></>;
    if (!state.success || !state.data) return <LibraryStatus kind="error">{state.error || "No se pudo cargar el reporte."}</LibraryStatus>;
    const report = state.data;

    return (
        <div className={styles.grid}>
            <div className={styles.kpis}>
                <div className={styles.kpi} data-tone="danger">
                    <span className={styles.kpiLabel}>Préstamos vencidos</span>
                    <strong className={styles.kpiValue}>{report.totalPrestamosVencidos}</strong>
                    <span className={styles.kpiHint}>
                        Promedio {report.promedioDiasAtraso} d · Máx {report.maxDiasAtraso} d de atraso
                    </span>
                </div>
                <div className={styles.kpi} data-tone="danger">
                    <span className={styles.kpiLabel}>Multas pendientes</span>
                    <strong className={styles.kpiValue}>{formatMoney(report.montoPendiente)}</strong>
                    <span className={styles.kpiHint}>Deuda activa exigible</span>
                </div>
                <div className={styles.kpi} data-tone="success">
                    <span className={styles.kpiLabel}>Multas cobradas</span>
                    <strong className={styles.kpiValue}>{formatMoney(report.montoPagado)}</strong>
                    <span className={styles.kpiHint}>Anuladas: {formatMoney(report.montoAnulado)}</span>
                </div>
                <div className={styles.kpi}>
                    <span className={styles.kpiLabel}>Total acumulado ({report.totalMultas})</span>
                    <strong className={styles.kpiValue}>{formatMoney(report.montoTotalMultas)}</strong>
                    <span className={styles.kpiHint}>Histórico de multas emitidas</span>
                </div>
            </div>

            <div className={`${styles.grid} ${styles.gridTwo}`}>
                <section className={styles.panel}>
                    <h2>Multas por motivo</h2>
                    {report.porMotivo.length === 0 ? (
                        <LibraryStatus kind="empty">No hay multas registradas.</LibraryStatus>
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Motivo</th>
                                        <th className={styles.num}>Cant.</th>
                                        <th className={styles.num}>Pendiente</th>
                                        <th className={styles.num}>Pagado</th>
                                        <th className={styles.num}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.porMotivo.map((m) => (
                                        <tr key={m.motivo}>
                                            <td><strong>{m.motivoLabel}</strong></td>
                                            <td className={styles.num}>{m.cantidad}</td>
                                            <td className={styles.num}>{formatMoney(m.montoPendiente)}</td>
                                            <td className={styles.num}>{formatMoney(m.montoPagado)}</td>
                                            <td className={styles.num}><strong>{formatMoney(m.montoTotal)}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className={styles.panel}>
                    <h2>Morosidad por sede</h2>
                    {report.porSede.length === 0 ? (
                        <LibraryStatus kind="empty">No hay datos por sede.</LibraryStatus>
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Sede</th>
                                        <th className={styles.num}>Vencidos</th>
                                        <th className={styles.num}>Pendiente</th>
                                        <th className={styles.num}>Pagado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.porSede.map((s) => (
                                        <tr key={s.sedeId}>
                                            <td><strong>{s.sedeNombre}</strong></td>
                                            <td className={styles.num}>{s.prestamosVencidos}</td>
                                            <td className={styles.num}>{formatMoney(s.montoPendiente)}</td>
                                            <td className={styles.num}>{formatMoney(s.montoPagado)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            <section className={styles.panel}>
                <h2>Detalle de préstamos vencidos</h2>
                {report.prestamosVencidos.length === 0 ? (
                    <LibraryStatus kind="empty">No hay préstamos vencidos actualmente.</LibraryStatus>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Préstamo</th>
                                    <th>Socio</th>
                                    <th>Sede</th>
                                    <th>Vencimiento</th>
                                    <th className={styles.num}>Atraso</th>
                                    <th className={styles.num}>Ejemplares pend.</th>
                                    <th className={styles.num}>Multa pendiente</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.prestamosVencidos.map((p) => (
                                    <tr key={p.prestamoId}>
                                        <td><strong>#{p.prestamoId}</strong></td>
                                        <td>
                                            <div>{p.socioNombre}</div>
                                            <div className={styles.subtext}>DNI {p.socioDocumento}</div>
                                        </td>
                                        <td>{p.sedeNombre}</td>
                                        <td>{p.fechaVencimiento ? String(p.fechaVencimiento).slice(0, 10) : "—"}</td>
                                        <td className={styles.num}>
                                            <LibraryBadge label={`${p.diasAtraso} días`} tone="danger" />
                                        </td>
                                        <td className={styles.num}>{p.cantidadEjemplaresPendientes}</td>
                                        <td className={styles.num}><strong>{formatMoney(p.multaPendienteMonto)}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

function DemandaView({ state }: { state: ReturnType<typeof useViewModel>["demanda"] }) {
    if (!state) return <><LibraryStatus>Generando ranking inter-sedes...</LibraryStatus><LibrarySkeleton /></>;
    if (!state.success || !state.data) return <LibraryStatus kind="error">{state.error || "No se pudo cargar el reporte."}</LibraryStatus>;
    const report = state.data;
    const maxSolicitudes = Math.max(1, ...report.libros.map((l) => l.totalSolicitudes));

    return (
        <div className={styles.grid}>
            <div className={styles.kpis}>
                <div className={styles.kpi}>
                    <span className={styles.kpiLabel}>Solicitudes inter-sedes</span>
                    <strong className={styles.kpiValue}>{report.totalSolicitudesInterbibliotecarias}</strong>
                    <span className={styles.kpiHint}>Total de pedidos interbibliotecarios</span>
                </div>
                <div className={styles.kpi} data-tone="active">
                    <span className={styles.kpiLabel}>Títulos distintos solicitados</span>
                    <strong className={styles.kpiValue}>{report.totalLibrosDistintos}</strong>
                    <span className={styles.kpiHint}>Variedad de catálogo demandado</span>
                </div>
                <div className={styles.kpi} data-tone="success">
                    <span className={styles.kpiLabel}>Tasa de aprobación global</span>
                    <strong className={styles.kpiValue}>{report.tasaAprobacionGlobalPorcentaje}%</strong>
                    <span className={styles.kpiHint}>Solicitudes aprobadas sobre el total</span>
                </div>
            </div>

            <section className={styles.panel}>
                <h2>Ranking de libros más solicitados entre sedes</h2>
                {report.libros.length === 0 ? (
                    <LibraryStatus kind="empty">No se registraron solicitudes interbibliotecarias.</LibraryStatus>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Libro</th>
                                    <th className={styles.num}>Solicitudes</th>
                                    <th className={styles.num}>Aprobadas</th>
                                    <th className={styles.num}>Pendientes</th>
                                    <th className={styles.num}>Rech./Canc.</th>
                                    <th className={styles.num}>Aprobación</th>
                                    <th>Sedes solicitantes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.libros.map((libro, index) => (
                                    <tr key={libro.libroId}>
                                        <td><strong>{index + 1}</strong></td>
                                        <td>
                                            <div><strong>{libro.titulo}</strong></div>
                                            <div className={styles.subtext}>
                                                {[libro.autores.join(", "), libro.editorial].filter(Boolean).join(" · ") || "—"}
                                            </div>
                                        </td>
                                        <td className={styles.num}>
                                            <div><strong>{libro.totalSolicitudes}</strong></div>
                                            <div className={styles.barTrack}>
                                                <div
                                                    className={styles.barFill}
                                                    style={{ width: `${(libro.totalSolicitudes / maxSolicitudes) * 100}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className={styles.num}>{libro.aprobadas}</td>
                                        <td className={styles.num}>{libro.pendientes}</td>
                                        <td className={styles.num}>{libro.rechazadas + libro.canceladas}</td>
                                        <td className={styles.num}>{libro.tasaAprobacionPorcentaje}%</td>
                                        <td>
                                            <div className={styles.chips}>
                                                {libro.sedesSolicitantes.map((sede) => (
                                                    <span key={sede} className={styles.chip}>{sede}</span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
