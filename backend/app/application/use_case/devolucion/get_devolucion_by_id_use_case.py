from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.devolucion import Devolucion
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.devolucion_repository_i import DevolucionRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetDevolucionByIdUseCase:
    def __init__(
        self,
        devolucion_repository: DevolucionRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.devolucion_repository = devolucion_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        devolucion: Devolucion

    def execute(self, command: Command) -> Result:
        user = AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.RECEPCIONISTA,
        )
        if command.id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        sede_id = user.sede_recepcionista()
        devolucion = (
            self.devolucion_repository.get_by_id_and_sede(command.id, sede_id) if sede_id is not None
            else self.devolucion_repository.get_by_id(command.id)
        )
        if devolucion is None:
            raise ErrorHandler(ErrorType.DEVOLUCION_NOT_FOUND)

        return GetDevolucionByIdUseCase.Result(devolucion=devolucion)
