from datetime import date
from typing import List, Optional, Union
from pydantic import BaseModel
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.report import (
    LibroInterbibliotecarioItem,
    LibrosInterbibliotecariosReport,
    IncidenciaDetalle,
    IncidenciaPorEstado,
    LogisticaIncidenciasReport,
    LogisticaSedeResumen,
    MovimientoRuta,
    MovimientoSedesReport,
    MultaPorMotivoResumen,
    MultasSedeResumen,
    PrestamosVencidosMultasReport,
    PrestamoVencidoDetalle,
)


class MovimientoRutaRes(BaseModel):
    sede_origen_id: int
    sede_origen_nombre: str
    sede_destino_id: int
    sede_destino_nombre: str
    cantidad_remitos: int
    cantidad_ejemplares: int
    remitos_recibidos: int
    remitos_en_transito: int
    tiempo_promedio_transito_dias: Optional[float] = None
    tiempo_minimo_transito_dias: Optional[int] = None
    tiempo_maximo_transito_dias: Optional[int] = None

    @staticmethod
    def from_domain(item: MovimientoRuta) -> "MovimientoRutaRes":
        return MovimientoRutaRes(
            sede_origen_id=item.sede_origen_id,
            sede_origen_nombre=item.sede_origen_nombre,
            sede_destino_id=item.sede_destino_id,
            sede_destino_nombre=item.sede_destino_nombre,
            cantidad_remitos=item.cantidad_remitos,
            cantidad_ejemplares=item.cantidad_ejemplares,
            remitos_recibidos=item.remitos_recibidos,
            remitos_en_transito=item.remitos_en_transito,
            tiempo_promedio_transito_dias=item.tiempo_promedio_transito_dias,
            tiempo_minimo_transito_dias=item.tiempo_minimo_transito_dias,
            tiempo_maximo_transito_dias=item.tiempo_maximo_transito_dias,
        )


class MovimientoSedesReportRes(BaseModel):
    total_remitos: int
    total_ejemplares_movidos: int
    tiempo_promedio_global_dias: Optional[float] = None
    rutas: List[MovimientoRutaRes] = []

    @staticmethod
    def from_domain(report: MovimientoSedesReport) -> "MovimientoSedesReportRes":
        return MovimientoSedesReportRes(
            total_remitos=report.total_remitos,
            total_ejemplares_movidos=report.total_ejemplares_movidos,
            tiempo_promedio_global_dias=report.tiempo_promedio_global_dias,
            rutas=[MovimientoRutaRes.from_domain(r) for r in report.rutas],
        )


class IncidenciaPorEstadoRes(BaseModel):
    estado: EstadoEjemplar
    cantidad: int

    @staticmethod
    def from_domain(item: IncidenciaPorEstado) -> "IncidenciaPorEstadoRes":
        return IncidenciaPorEstadoRes(estado=item.estado, cantidad=item.cantidad)


class LogisticaSedeResumenRes(BaseModel):
    sede_id: int
    sede_nombre: str
    total_envios: int
    exitosos: int
    con_incidencia: int
    en_curso: int
    tasa_exito_porcentaje: float
    tasa_incidencia_porcentaje: float

    @staticmethod
    def from_domain(item: LogisticaSedeResumen) -> "LogisticaSedeResumenRes":
        return LogisticaSedeResumenRes(
            sede_id=item.sede_id,
            sede_nombre=item.sede_nombre,
            total_envios=item.total_envios,
            exitosos=item.exitosos,
            con_incidencia=item.con_incidencia,
            en_curso=item.en_curso,
            tasa_exito_porcentaje=item.tasa_exito_porcentaje,
            tasa_incidencia_porcentaje=item.tasa_incidencia_porcentaje,
        )


class IncidenciaDetalleRes(BaseModel):
    remito_id: int
    remito_numero: str
    sede_origen_nombre: str
    sede_destino_nombre: str
    ejemplar_id: int
    ejemplar_codigo: str
    estado: EstadoEjemplar
    observacion: str

    @staticmethod
    def from_domain(item: IncidenciaDetalle) -> "IncidenciaDetalleRes":
        return IncidenciaDetalleRes(
            remito_id=item.remito_id,
            remito_numero=item.remito_numero,
            sede_origen_nombre=item.sede_origen_nombre,
            sede_destino_nombre=item.sede_destino_nombre,
            ejemplar_id=item.ejemplar_id,
            ejemplar_codigo=item.ejemplar_codigo,
            estado=item.estado,
            observacion=item.observacion,
        )


class LogisticaIncidenciasReportRes(BaseModel):
    total_remitos: int
    remitos_finalizados: int
    remitos_exitosos: int
    remitos_con_incidencia: int
    remitos_en_curso: int
    tasa_exito_porcentaje: float
    tasa_incidencia_porcentaje: float
    incidencias_por_estado: List[IncidenciaPorEstadoRes] = []
    por_sede_origen: List[LogisticaSedeResumenRes] = []
    incidencias_recientes: List[IncidenciaDetalleRes] = []

    @staticmethod
    def from_domain(report: LogisticaIncidenciasReport) -> "LogisticaIncidenciasReportRes":
        return LogisticaIncidenciasReportRes(
            total_remitos=report.total_remitos,
            remitos_finalizados=report.remitos_finalizados,
            remitos_exitosos=report.remitos_exitosos,
            remitos_con_incidencia=report.remitos_con_incidencia,
            remitos_en_curso=report.remitos_en_curso,
            tasa_exito_porcentaje=report.tasa_exito_porcentaje,
            tasa_incidencia_porcentaje=report.tasa_incidencia_porcentaje,
            incidencias_por_estado=[
                IncidenciaPorEstadoRes.from_domain(i) for i in report.incidencias_por_estado
            ],
            por_sede_origen=[LogisticaSedeResumenRes.from_domain(s) for s in report.por_sede_origen],
            incidencias_recientes=[
                IncidenciaDetalleRes.from_domain(d) for d in report.incidencias_recientes
            ],
        )


class MultaPorMotivoResumenRes(BaseModel):
    motivo: MotivoMulta
    cantidad: int
    monto_total: float
    monto_pendiente: float
    monto_pagado: float

    @staticmethod
    def from_domain(item: MultaPorMotivoResumen) -> "MultaPorMotivoResumenRes":
        return MultaPorMotivoResumenRes(
            motivo=item.motivo,
            cantidad=item.cantidad,
            monto_total=item.monto_total,
            monto_pendiente=item.monto_pendiente,
            monto_pagado=item.monto_pagado,
        )


class MultasSedeResumenRes(BaseModel):
    sede_id: int
    sede_nombre: str
    prestamos_vencidos: int
    monto_pendiente: float
    monto_pagado: float
    monto_anulado: float

    @staticmethod
    def from_domain(item: MultasSedeResumen) -> "MultasSedeResumenRes":
        return MultasSedeResumenRes(
            sede_id=item.sede_id,
            sede_nombre=item.sede_nombre,
            prestamos_vencidos=item.prestamos_vencidos,
            monto_pendiente=item.monto_pendiente,
            monto_pagado=item.monto_pagado,
            monto_anulado=item.monto_anulado,
        )


class PrestamoVencidoDetalleRes(BaseModel):
    prestamo_id: int
    socio_id: int
    socio_nombre: str
    socio_documento: str
    sede_id: int
    sede_nombre: str
    fecha_inicio: Optional[Union[date, str]] = None
    fecha_vencimiento: Optional[Union[date, str]] = None
    dias_atraso: int
    cantidad_ejemplares_pendientes: int
    multa_pendiente_monto: float

    @staticmethod
    def from_domain(item: PrestamoVencidoDetalle) -> "PrestamoVencidoDetalleRes":
        return PrestamoVencidoDetalleRes(
            prestamo_id=item.prestamo_id,
            socio_id=item.socio_id,
            socio_nombre=item.socio_nombre,
            socio_documento=item.socio_documento,
            sede_id=item.sede_id,
            sede_nombre=item.sede_nombre,
            fecha_inicio=item.fecha_inicio,
            fecha_vencimiento=item.fecha_vencimiento,
            dias_atraso=item.dias_atraso,
            cantidad_ejemplares_pendientes=item.cantidad_ejemplares_pendientes,
            multa_pendiente_monto=item.multa_pendiente_monto,
        )


class PrestamosVencidosMultasReportRes(BaseModel):
    total_prestamos_vencidos: int
    promedio_dias_atraso: float
    max_dias_atraso: int
    total_multas: int
    monto_total_multas: float
    monto_pendiente: float
    monto_pagado: float
    monto_anulado: float
    por_motivo: List[MultaPorMotivoResumenRes] = []
    por_sede: List[MultasSedeResumenRes] = []
    prestamos_vencidos: List[PrestamoVencidoDetalleRes] = []

    @staticmethod
    def from_domain(report: PrestamosVencidosMultasReport) -> "PrestamosVencidosMultasReportRes":
        return PrestamosVencidosMultasReportRes(
            total_prestamos_vencidos=report.total_prestamos_vencidos,
            promedio_dias_atraso=report.promedio_dias_atraso,
            max_dias_atraso=report.max_dias_atraso,
            total_multas=report.total_multas,
            monto_total_multas=report.monto_total_multas,
            monto_pendiente=report.monto_pendiente,
            monto_pagado=report.monto_pagado,
            monto_anulado=report.monto_anulado,
            por_motivo=[MultaPorMotivoResumenRes.from_domain(m) for m in report.por_motivo],
            por_sede=[MultasSedeResumenRes.from_domain(s) for s in report.por_sede],
            prestamos_vencidos=[
                PrestamoVencidoDetalleRes.from_domain(p) for p in report.prestamos_vencidos
            ],
        )


class LibroInterbibliotecarioItemRes(BaseModel):
    libro_id: int
    titulo: str
    editorial: str
    autores: List[str] = []
    total_solicitudes: int
    aprobadas: int
    pendientes: int
    rechazadas: int
    canceladas: int
    tasa_aprobacion_porcentaje: float
    sedes_solicitantes: List[str] = []

    @staticmethod
    def from_domain(item: LibroInterbibliotecarioItem) -> "LibroInterbibliotecarioItemRes":
        return LibroInterbibliotecarioItemRes(
            libro_id=item.libro_id,
            titulo=item.titulo,
            editorial=item.editorial,
            autores=item.autores,
            total_solicitudes=item.total_solicitudes,
            aprobadas=item.aprobadas,
            pendientes=item.pendientes,
            rechazadas=item.rechazadas,
            canceladas=item.canceladas,
            tasa_aprobacion_porcentaje=item.tasa_aprobacion_porcentaje,
            sedes_solicitantes=item.sedes_solicitantes,
        )


class LibrosInterbibliotecariosReportRes(BaseModel):
    total_solicitudes_interbibliotecarias: int
    total_libros_distintos: int
    tasa_aprobacion_global_porcentaje: float
    libros: List[LibroInterbibliotecarioItemRes] = []

    @staticmethod
    def from_domain(report: LibrosInterbibliotecariosReport) -> "LibrosInterbibliotecariosReportRes":
        return LibrosInterbibliotecariosReportRes(
            total_solicitudes_interbibliotecarias=report.total_solicitudes_interbibliotecarias,
            total_libros_distintos=report.total_libros_distintos,
            tasa_aprobacion_global_porcentaje=report.tasa_aprobacion_global_porcentaje,
            libros=[LibroInterbibliotecarioItemRes.from_domain(l) for l in report.libros],
        )
