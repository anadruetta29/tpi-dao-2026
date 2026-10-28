from app.domain.entities.solicitud_prestamo import SolicitudPrestamo
from app.domain.datasources.base_datasource import BaseDatasource
from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter


class SolicitudPrestamoRepository(BaseRepositoryAdapter[SolicitudPrestamo]):
    def __init__(self, datasource: BaseDatasource[SolicitudPrestamo]) -> None:
        super().__init__(datasource)
