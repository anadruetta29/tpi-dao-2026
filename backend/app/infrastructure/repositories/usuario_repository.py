from app.domain.entities.usuario import Usuario
from app.domain.datasources.base_datasource import BaseDatasource
from app.infrastructure.repositories.base_repository_adapter import BaseRepositoryAdapter


class UsuarioRepository(BaseRepositoryAdapter[Usuario]):
    def __init__(self, datasource: BaseDatasource[Usuario]) -> None:
        super().__init__(datasource)
