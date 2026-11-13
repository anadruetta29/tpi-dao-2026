from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_sede import EstadoSede
from app.domain.entity.rol import Rol
from app.domain.entity.sede import Sede
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreateSedeUseCase:
    def __init__(
        self,
        sede_repository: SedeRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.sede_repository = sede_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        nombre: Optional[str]
        telefono: Optional[str]
        email: Optional[str]
        horarioAtencion: Optional[str]

    @dataclass(frozen=True)
    class Result:
        sede: Sede

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(command.token, self.usuario_repository, Rol.ADMIN)

        if (
            not command.nombre
            or not command.telefono
            or not command.email
            or not command.horarioAtencion
        ):
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        if self.sede_repository.get_by_nombre(command.nombre) is not None:
            raise ErrorHandler(ErrorType.SEDE_ALREADY_EXISTS)

        sede = Sede(
            nombre=command.nombre,
            telefono=command.telefono,
            email=command.email,
            horarioAtencion=command.horarioAtencion,
            estado=EstadoSede.ACTIVA,
        )
        saved = self.sede_repository.save(sede)
        return CreateSedeUseCase.Result(sede=saved)
