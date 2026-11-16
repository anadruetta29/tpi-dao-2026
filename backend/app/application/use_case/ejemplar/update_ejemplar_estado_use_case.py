from contextlib import nullcontext
from dataclasses import dataclass
from datetime import date
from typing import Callable, ContextManager, Optional
from app.application.state.ejemplar.core.ejemplar_factory import (
    EjemplarEstadoStateFactory,
)
from app.application.use_case.reserva.asignar_reserva_use_case import asignar_reserva
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.aviso_repository_i import AvisoRepositoryI
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class UpdateEjemplarEstadoUseCase:
    def __init__(
        self,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        ejemplar_state_factory: Optional[EjemplarEstadoStateFactory] = None,
        reserva_repository: Optional[ReservaRepositoryI] = None,
        aviso_repository: Optional[AvisoRepositoryI] = None,
        transaction: Callable[[], ContextManager] = nullcontext,
    ) -> None:
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository
        self.ejemplar_state_factory = ejemplar_state_factory or EjemplarEstadoStateFactory()
        self.reserva_repository = reserva_repository
        self.aviso_repository = aviso_repository
        self.transaction = transaction

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]
        estado: Optional[EstadoEjemplar]

    @dataclass(frozen=True)
    class Result:
        ejemplar: Ejemplar

    def execute(self, command: Command) -> Result:
        with self.transaction():
            return self._execute(command)

    def _execute(self, command: Command) -> Result:
        user = AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.RECEPCIONISTA,
        )
        if command.id is None or command.estado is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        ejemplar = self.ejemplar_repository.get_by_id_for_update(command.id)
        if ejemplar is None:
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)

        user.validar_sede(ejemplar.sede_id)

        state = self.ejemplar_state_factory.get_state(ejemplar.estado)
        state.resolver_revision(ejemplar, command.estado)

        updated = self.ejemplar_repository.update(command.id, ejemplar)
        if updated is None:
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)

        if (
            updated.estado == EstadoEjemplar.DISPONIBLE
            and self.reserva_repository is not None
        ):
            if asignar_reserva(
                updated,
                self.reserva_repository,
                date.today(),
                aviso_repository=self.aviso_repository,
            ) is not None:
                updated = self.ejemplar_repository.update(command.id, updated) or updated

        return UpdateEjemplarEstadoUseCase.Result(ejemplar=updated)
