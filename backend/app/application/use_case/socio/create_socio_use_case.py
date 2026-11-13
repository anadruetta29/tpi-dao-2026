from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_socio import EstadoSocio
from app.domain.entity.rol import Rol
from app.domain.entity.socio import Socio
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreateSocioUseCase:
    def __init__(
        self,
        socio_repository: SocioRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.socio_repository = socio_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        nombre: Optional[str]
        apellido: Optional[str]
        documento: Optional[str]
        email: Optional[str]
        telefono: Optional[str]

    @dataclass(frozen=True)
    class Result:
        socio: Socio

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        if (
            not command.nombre
            or not command.apellido
            or not command.documento
            or not command.email
            or not command.telefono
        ):
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        if self.socio_repository.get_by_documento(command.documento) is not None:
            raise ErrorHandler(ErrorType.SOCIO_ALREADY_EXISTS)
        if self.socio_repository.get_by_email(command.email) is not None:
            raise ErrorHandler(ErrorType.SOCIO_ALREADY_EXISTS)

        socio = Socio(
            nombre=command.nombre,
            apellido=command.apellido,
            documento=command.documento,
            email=command.email,
            telefono=command.telefono,
            estado=EstadoSocio.HABILITADO,
        )
        saved = self.socio_repository.save(socio)
        return CreateSocioUseCase.Result(socio=saved)
