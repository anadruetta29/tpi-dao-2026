from dataclasses import dataclass
from datetime import date
from typing import Optional
from app.application.strategy.ejemplar_estado.core.ejemplar_estado_state_factory import (
    EjemplarEstadoStateFactory,
)
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.reserva import Reserva
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.libro_repository_i import LibroRepositoryI
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreateReservaUseCase:
    def __init__(
        self,
        reserva_repository: ReservaRepositoryI,
        socio_repository: SocioRepositoryI,
        libro_repository: LibroRepositoryI,
        sede_repository: SedeRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        ejemplar_state_factory: Optional[EjemplarEstadoStateFactory] = None,
    ) -> None:
        self.reserva_repository = reserva_repository
        self.socio_repository = socio_repository
        self.libro_repository = libro_repository
        self.sede_repository = sede_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository
        self.ejemplar_state_factory = ejemplar_state_factory or EjemplarEstadoStateFactory()

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        socio_id: Optional[int]
        libro_id: Optional[int]
        sede_id: Optional[int]
        ejemplar_id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        reserva: Reserva

    def execute(self, command: Command) -> Result:
        usuario = AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        if command.socio_id is None or (command.libro_id is None and command.ejemplar_id is None):
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        sede_recepcionista = usuario.sede_recepcionista()
        if command.sede_id is not None:
            usuario.validar_sede(command.sede_id)
        sede_id = command.sede_id or sede_recepcionista

        socio = self.socio_repository.get_by_id(command.socio_id)
        if socio is None:
            raise ErrorHandler(ErrorType.SOCIO_NOT_FOUND)
        socio.validar_habilitado()

        if sede_id is not None:
            sede = self.sede_repository.get_by_id(sede_id)
            if sede is None:
                raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)
            sede.validar_activa()

        libro_id = command.libro_id
        if command.ejemplar_id is not None:
            ejemplar = self.ejemplar_repository.get_by_id(command.ejemplar_id)
            if ejemplar is None:
                raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
            if (libro_id is not None and libro_id != ejemplar.libro_id) or (
                sede_id is not None and sede_id != ejemplar.sede_id
            ):
                raise ErrorHandler(ErrorType.RESERVA_EJEMPLAR_NO_COINCIDE)
            libro_id = ejemplar.libro_id
            if ejemplar.estado == EstadoEjemplar.DISPONIBLE:
                raise ErrorHandler(ErrorType.RESERVA_LIBRO_DISPONIBLE)
            self.ejemplar_state_factory.get_state(ejemplar.estado).validar_reserva(
                ejemplar
            )

        if libro_id is None or self.libro_repository.get_by_id(libro_id) is None:
            raise ErrorHandler(ErrorType.LIBRO_NOT_FOUND)
        if self.ejemplar_repository.get_all_filtered(
            libro_id=libro_id, sede_id=sede_id, estado=EstadoEjemplar.DISPONIBLE
        ):
            raise ErrorHandler(ErrorType.RESERVA_LIBRO_DISPONIBLE)

        reserva = Reserva(
            fecha=date.today(),
            estado=EstadoReserva.ACTIVA,
            socio_id=command.socio_id,
            libro_id=libro_id,
            sede_id=sede_id,
            ejemplar_id=command.ejemplar_id,
        )
        saved = self.reserva_repository.save(reserva)
        return CreateReservaUseCase.Result(reserva=saved)
