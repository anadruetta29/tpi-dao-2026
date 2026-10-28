from app.domain.entities.historial_estado_remito import HistorialEstadoRemito
from app.domain.datasources.base_datasource import BaseDatasource
from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter


class HistorialEstadoRemitoRepository(BaseRepositoryAdapter[HistorialEstadoRemito]):
    def __init__(self, datasource: BaseDatasource[HistorialEstadoRemito]) -> None:
        super().__init__(datasource)
