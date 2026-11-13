from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.prestamo import Prestamo
from app.domain.entity.rol import Rol
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllPrestamosUseCase:
    def __init__(
        self,
        prestamo_repository: PrestamoRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.prestamo_repository = prestamo_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        socio_id: Optional[int] = None
        sede_id: Optional[int] = None
        estado: Optional[EstadoPrestamo] = None

    @dataclass(frozen=True)
    class Result:
        prestamos: List[Prestamo]

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        prestamos = self.prestamo_repository.get_all_filtered(
            socio_id=command.socio_id,
            sede_id=command.sede_id,
            estado=command.estado,
        )
        return GetAllPrestamosUseCase.Result(prestamos=prestamos)
