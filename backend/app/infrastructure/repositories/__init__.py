from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter
from app.infrastructure.repositories.usuario_repository import UsuarioRepository
from app.infrastructure.repositories.socio_repository import SocioRepository
from app.infrastructure.repositories.sede_repository import SedeRepository
from app.infrastructure.repositories.libro_repository import LibroRepository
from app.infrastructure.repositories.autor_repository import AutorRepository
from app.infrastructure.repositories.ejemplar_repository import EjemplarRepository
from app.infrastructure.repositories.reserva_repository import ReservaRepository
from app.infrastructure.repositories.solicitud_prestamo_repository import SolicitudPrestamoRepository
from app.infrastructure.repositories.prestamo_repository import PrestamoRepository
from app.infrastructure.repositories.devolucion_repository import DevolucionRepository
from app.infrastructure.repositories.multa_repository import MultaRepository
from app.infrastructure.repositories.remito_repository import RemitoRepository
from app.infrastructure.repositories.historial_estado_remito_repository import HistorialEstadoRemitoRepository

__all__ = [
    "BaseRepositoryAdapter",
    "UsuarioRepository",
    "SocioRepository",
    "SedeRepository",
    "LibroRepository",
    "AutorRepository",
    "EjemplarRepository",
    "ReservaRepository",
    "SolicitudPrestamoRepository",
    "PrestamoRepository",
    "DevolucionRepository",
    "MultaRepository",
    "RemitoRepository",
    "HistorialEstadoRemitoRepository",
]
