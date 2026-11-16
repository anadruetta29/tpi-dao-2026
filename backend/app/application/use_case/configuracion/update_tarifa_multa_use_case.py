from contextlib import nullcontext
from dataclasses import dataclass
from typing import Callable, ContextManager, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.rol import Rol
from app.domain.entity.tarifa_multa import TarifaMulta
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.tarifa_multa_repository_i import TarifaMultaRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class UpdateTarifaMultaUseCase:
    def __init__(
        self,
        tarifa_multa_repository: TarifaMultaRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        transaction: Callable[[], ContextManager] = nullcontext,
    ) -> None:
        self.tarifa_multa_repository = tarifa_multa_repository
        self.usuario_repository = usuario_repository
        self.transaction = transaction

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        motivo: Optional[MotivoMulta]
        monto: Optional[float]

    @dataclass(frozen=True)
    class Result:
        tarifa: TarifaMulta

    def execute(self, command: Command) -> Result:
        with self.transaction():
            return self._execute(command)

    def _execute(self, command: Command) -> Result:
        AuthHelper.authenticate(command.token, self.usuario_repository, Rol.ADMIN)
        if command.motivo is None or command.monto is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)
        if command.monto <= 0:
            raise ErrorHandler(ErrorType.BAD_REQUEST, "El monto de la tarifa debe ser mayor a cero.")

        saved = self.tarifa_multa_repository.save_or_update(
            TarifaMulta(motivo=command.motivo, monto=float(command.monto))
        )
        return UpdateTarifaMultaUseCase.Result(tarifa=saved)
