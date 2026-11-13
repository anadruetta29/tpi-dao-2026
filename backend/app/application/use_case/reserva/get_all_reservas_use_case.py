from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.reserva import Reserva
from app.domain.entity.rol import Rol
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllReservasUseCase:
    def __init__(
        self,
        reserva_repository: ReservaRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.reserva_repository = reserva_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        libro_id: Optional[int] = None
        socio_id: Optional[int] = None
        sede_id: Optional[int] = None
        estado: Optional[EstadoReserva] = None

    @dataclass(frozen=True)
    class Result:
        reservas: List[Reserva]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        reservas = self.reserva_repository.get_all_filtered(
            libro_id=command.libro_id,
            socio_id=command.socio_id,
            sede_id=command.sede_id,
            estado=command.estado,
        )
        return GetAllReservasUseCase.Result(reservas=reservas)
