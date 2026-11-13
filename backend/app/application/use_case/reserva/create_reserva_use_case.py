from dataclasses import dataclass
from datetime import date
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.estado_sede import EstadoSede
from app.domain.entity.estado_socio import EstadoSocio
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
    ) -> None:
        self.reserva_repository = reserva_repository
        self.socio_repository = socio_repository
        self.libro_repository = libro_repository
        self.sede_repository = sede_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        socio_id: Optional[int]
        libro_id: Optional[int]
        sede_id: Optional[int]
        ejemplar_id: Optional[int]
        fecha: Optional[date]

    @dataclass(frozen=True)
    class Result:
        reserva: Reserva

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        if command.socio_id is None or (command.libro_id is None and command.ejemplar_id is None):
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        socio = self.socio_repository.get_by_id(command.socio_id)
        if socio is None:
            raise ErrorHandler(ErrorType.SOCIO_NOT_FOUND)
        if socio.estado == EstadoSocio.INHABILITADO:
            raise ErrorHandler(ErrorType.SOCIO_INHABILITADO)

        if command.libro_id is not None and self.libro_repository.get_by_id(command.libro_id) is None:
            raise ErrorHandler(ErrorType.LIBRO_NOT_FOUND)

        if command.sede_id is not None:
            sede = self.sede_repository.get_by_id(command.sede_id)
            if sede is None:
                raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)
            if sede.estado == EstadoSede.BAJA:
                raise ErrorHandler(ErrorType.SEDE_INACTIVE)

        if command.ejemplar_id is not None:
            if self.ejemplar_repository.get_by_id(command.ejemplar_id) is None:
                raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)

        reserva = Reserva(
            fecha=command.fecha or date.today(),
            estado=EstadoReserva.ACTIVA,
            socio_id=command.socio_id,
            libro_id=command.libro_id,
            sede_id=command.sede_id,
            ejemplar_id=command.ejemplar_id,
        )
        saved = self.reserva_repository.save(reserva)
        return CreateReservaUseCase.Result(reserva=saved)
