from app.domain.entities.reserva import Reserva
from app.domain.datasources.base_datasource import BaseDatasource
from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter


class ReservaRepository(BaseRepositoryAdapter[Reserva]):
    def __init__(self, datasource: BaseDatasource[Reserva]) -> None:
        super().__init__(datasource)
