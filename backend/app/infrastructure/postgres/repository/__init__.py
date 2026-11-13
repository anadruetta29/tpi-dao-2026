from sqlalchemy.orm import Session
from app.infrastructure.postgres.model.autor_model import AutorModel
from app.infrastructure.postgres.model.devolucion_model import DevolucionModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository
from app.infrastructure.postgres.repository.postgres_ejemplar_repository import PostgresEjemplarRepository
from app.infrastructure.postgres.repository.postgres_historial_estado_remito_repository import PostgresHistorialEstadoRemitoRepository
from app.infrastructure.postgres.repository.postgres_libro_repository import PostgresLibroRepository
from app.infrastructure.postgres.repository.postgres_multa_repository import PostgresMultaRepository
from app.infrastructure.postgres.repository.postgres_prestamo_repository import PostgresPrestamoRepository
from app.infrastructure.postgres.repository.postgres_remito_repository import PostgresRemitoRepository
from app.infrastructure.postgres.repository.postgres_reserva_repository import PostgresReservaRepository
from app.infrastructure.postgres.repository.postgres_sede_repository import PostgresSedeRepository
from app.infrastructure.postgres.repository.postgres_socio_repository import PostgresSocioRepository
from app.infrastructure.postgres.repository.postgres_solicitud_prestamo_repository import PostgresSolicitudPrestamoRepository
from app.infrastructure.postgres.repository.postgres_usuario_repository import PostgresUsuarioRepository


class PostgresAutorRepository(BasePostgresRepository[AutorModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, AutorModel)


class PostgresDevolucionRepository(BasePostgresRepository[DevolucionModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, DevolucionModel)


__all__ = [
    "BasePostgresRepository",
    "PostgresUsuarioRepository",
    "PostgresSedeRepository",
    "PostgresSocioRepository",
    "PostgresLibroRepository",
    "PostgresAutorRepository",
    "PostgresEjemplarRepository",
    "PostgresSolicitudPrestamoRepository",
    "PostgresPrestamoRepository",
    "PostgresReservaRepository",
    "PostgresRemitoRepository",
    "PostgresHistorialEstadoRemitoRepository",
    "PostgresDevolucionRepository",
    "PostgresMultaRepository",
]
