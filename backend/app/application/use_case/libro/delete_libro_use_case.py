from dataclasses import dataclass
from typing import Optional
from app.application.state.ejemplar.core.ejemplar_factory import (
    EjemplarEstadoStateFactory,
)
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.libro_repository_i import LibroRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class DeleteLibroUseCase:
    def __init__(
        self,
        libro_repository: LibroRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        ejemplar_repository: Optional[EjemplarRepositoryI] = None,
        ejemplar_state_factory: Optional[EjemplarEstadoStateFactory] = None,
    ) -> None:
        self.libro_repository = libro_repository
        self.usuario_repository = usuario_repository
        self.ejemplar_repository = ejemplar_repository
        self.ejemplar_state_factory = ejemplar_state_factory or EjemplarEstadoStateFactory()

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        deleted: bool

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.RECEPCIONISTA,
        )
        if command.id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        libro = self.libro_repository.get_by_id(command.id)
        if libro is None:
            raise ErrorHandler(ErrorType.LIBRO_NOT_FOUND)

        if self.ejemplar_repository is not None:
            ejemplares = self.ejemplar_repository.get_all_filtered(libro_id=command.id)
            for ejemplar in ejemplares:
                if ejemplar.estado is not None:
                    self.ejemplar_state_factory.get_state(ejemplar.estado).validar_eliminacion(
                        "No se puede eliminar el libro porque tiene ejemplares prestados, reservados o en tránsito."
                    )

        deleted = self.libro_repository.delete(command.id)
        if not deleted:
            raise ErrorHandler(ErrorType.LIBRO_NOT_FOUND)

        return DeleteLibroUseCase.Result(deleted=True)
