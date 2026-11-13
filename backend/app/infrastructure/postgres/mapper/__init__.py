from app.infrastructure.postgres.mapper.usuario_entity_mapper import UsuarioEntityMapper
from app.infrastructure.postgres.mapper.autor_entity_mapper import AutorEntityMapper
from app.infrastructure.postgres.mapper.devolucion_entity_mapper import DevolucionEntityMapper
from app.infrastructure.postgres.mapper.ejemplar_entity_mapper import EjemplarEntityMapper
from app.infrastructure.postgres.mapper.historial_estado_remito_entity_mapper import HistorialEstadoRemitoEntityMapper
from app.infrastructure.postgres.mapper.libro_entity_mapper import LibroEntityMapper
from app.infrastructure.postgres.mapper.multa_entity_mapper import MultaEntityMapper
from app.infrastructure.postgres.mapper.prestamo_entity_mapper import PrestamoEntityMapper
from app.infrastructure.postgres.mapper.remito_entity_mapper import RemitoEntityMapper
from app.infrastructure.postgres.mapper.reserva_entity_mapper import ReservaEntityMapper
from app.infrastructure.postgres.mapper.sede_entity_mapper import SedeEntityMapper
from app.infrastructure.postgres.mapper.socio_entity_mapper import SocioEntityMapper
from app.infrastructure.postgres.mapper.solicitud_prestamo_entity_mapper import SolicitudPrestamoEntityMapper

__all__ = [
    "UsuarioEntityMapper",
    "AutorEntityMapper",
    "DevolucionEntityMapper",
    "EjemplarEntityMapper",
    "HistorialEstadoRemitoEntityMapper",
    "LibroEntityMapper",
    "MultaEntityMapper",
    "PrestamoEntityMapper",
    "RemitoEntityMapper",
    "ReservaEntityMapper",
    "SedeEntityMapper",
    "SocioEntityMapper",
    "SolicitudPrestamoEntityMapper",
]
