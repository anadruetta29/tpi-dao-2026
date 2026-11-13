from app.domain.repository.base_repository_i import BaseRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.libro_repository_i import LibroRepositoryI
from app.domain.repository.autor_repository_i import AutorRepositoryI
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.solicitud_prestamo_repository_i import SolicitudPrestamoRepositoryI
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.remito_repository_i import RemitoRepositoryI
from app.domain.repository.historial_estado_remito_repository_i import HistorialEstadoRemitoRepositoryI
from app.domain.repository.devolucion_repository_i import DevolucionRepositoryI
from app.domain.repository.multa_repository_i import MultaRepositoryI

__all__ = [
    "BaseRepositoryI",
    "UsuarioRepositoryI",
    "SedeRepositoryI",
    "SocioRepositoryI",
    "LibroRepositoryI",
    "AutorRepositoryI",
    "EjemplarRepositoryI",
    "SolicitudPrestamoRepositoryI",
    "PrestamoRepositoryI",
    "ReservaRepositoryI",
    "RemitoRepositoryI",
    "HistorialEstadoRemitoRepositoryI",
    "DevolucionRepositoryI",
    "MultaRepositoryI",
]
