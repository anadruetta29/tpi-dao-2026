from app.domain.report.libros_interbibliotecarios_report import (
    LibroInterbibliotecarioItem,
    LibrosInterbibliotecariosReport,
)
from app.domain.report.logistica_incidencias_report import (
    IncidenciaDetalle,
    IncidenciaPorEstado,
    LogisticaIncidenciasReport,
    LogisticaSedeResumen,
)
from app.domain.report.movimiento_sedes_report import (
    MovimientoRuta,
    MovimientoSedesReport,
)
from app.domain.report.prestamos_vencidos_multas_report import (
    MultaPorMotivoResumen,
    MultasSedeResumen,
    PrestamosVencidosMultasReport,
    PrestamoVencidoDetalle,
)

__all__ = [
    "MovimientoRuta",
    "MovimientoSedesReport",
    "IncidenciaPorEstado",
    "LogisticaSedeResumen",
    "IncidenciaDetalle",
    "LogisticaIncidenciasReport",
    "MultaPorMotivoResumen",
    "MultasSedeResumen",
    "PrestamoVencidoDetalle",
    "PrestamosVencidosMultasReport",
    "LibroInterbibliotecarioItem",
    "LibrosInterbibliotecariosReport",
]
