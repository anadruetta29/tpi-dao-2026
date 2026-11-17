from dataclasses import dataclass
from typing import Callable, ContextManager, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.aviso import Aviso
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.aviso_repository_i import AvisoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class MarcarAvisoLeidoUseCase:
    def __init__(
        self,
        aviso_repository: AvisoRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        transaction: Callable[[], ContextManager],
    ) -> None:
        self.aviso_repository = aviso_repository
        self.usuario_repository = usuario_repository
        self.transaction = transaction

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        aviso: Aviso

    def execute(self, command: Command) -> Result:
        if command.id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)
        with self.transaction():
            usuario = AuthHelper.authenticate(
                command.token,
                self.usuario_repository,
                Rol.ADMIN,
                Rol.RECEPCIONISTA,
            )
            aviso = self.aviso_repository.marcar_leido(
                command.id, usuario.id, usuario.sede_recepcionista()
            )
            if aviso is None:
                raise ErrorHandler(ErrorType.NOT_FOUND, "Aviso no encontrado.")
            return MarcarAvisoLeidoUseCase.Result(aviso=aviso)
