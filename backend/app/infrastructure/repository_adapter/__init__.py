from app.infrastructure.repository_adapter.base_repository_adapter import BaseRepositoryAdapter
from app.infrastructure.repository_adapter.usuario_repository_adapter import UsuarioRepositoryAdapter
from app.infrastructure.repository_adapter.sede_repository_adapter import SedeRepositoryAdapter
from app.infrastructure.repository_adapter.socio_repository_adapter import SocioRepositoryAdapter
from app.infrastructure.repository_adapter.libro_repository_adapter import LibroRepositoryAdapter
from app.infrastructure.repository_adapter.autor_repository_adapter import AutorRepositoryAdapter
from app.infrastructure.repository_adapter.ejemplar_repository_adapter import EjemplarRepositoryAdapter
from app.infrastructure.repository_adapter.solicitud_prestamo_repository_adapter import (
    SolicitudPrestamoRepositoryAdapter,
)
from app.infrastructure.repository_adapter.prestamo_repository_adapter import PrestamoRepositoryAdapter
from app.infrastructure.repository_adapter.reserva_repository_adapter import ReservaRepositoryAdapter
from app.infrastructure.repository_adapter.remito_repository_adapter import RemitoRepositoryAdapter
from app.infrastructure.repository_adapter.historial_estado_remito_repository_adapter import (
    HistorialEstadoRemitoRepositoryAdapter,
)
from app.infrastructure.repository_adapter.devolucion_repository_adapter import DevolucionRepositoryAdapter
from app.infrastructure.repository_adapter.multa_repository_adapter import MultaRepositoryAdapter

__all__ = [
    "BaseRepositoryAdapter",
    "UsuarioRepositoryAdapter",
    "SedeRepositoryAdapter",
    "SocioRepositoryAdapter",
    "LibroRepositoryAdapter",
    "AutorRepositoryAdapter",
    "EjemplarRepositoryAdapter",
    "SolicitudPrestamoRepositoryAdapter",
    "PrestamoRepositoryAdapter",
    "ReservaRepositoryAdapter",
    "RemitoRepositoryAdapter",
    "HistorialEstadoRemitoRepositoryAdapter",
    "DevolucionRepositoryAdapter",
    "MultaRepositoryAdapter",
]
