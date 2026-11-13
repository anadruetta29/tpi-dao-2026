from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.libro_repository_i import LibroRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetLibroDisponibilidadUseCase:
    def __init__(
        self,
        libro_repository: LibroRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.libro_repository = libro_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        libro_id: int
        ejemplares: List[Ejemplar]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        if command.id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        libro = self.libro_repository.get_by_id(command.id)
        if libro is None:
            raise ErrorHandler(ErrorType.LIBRO_NOT_FOUND)

        ejemplares = self.ejemplar_repository.get_all_filtered(libro_id=command.id)
        return GetLibroDisponibilidadUseCase.Result(libro_id=command.id, ejemplares=ejemplares)
