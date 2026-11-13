from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.rol import Rol
from app.domain.entity.socio import Socio
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class UpdateSocioUseCase:
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
        id: Optional[int]
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
        if command.id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        socio = self.socio_repository.get_by_id(command.id)
        if socio is None:
            raise ErrorHandler(ErrorType.SOCIO_NOT_FOUND)

        if command.nombre is not None:
            socio.nombre = command.nombre
        if command.apellido is not None:
            socio.apellido = command.apellido
        if command.documento is not None:
            existing_doc = self.socio_repository.get_by_documento(command.documento)
            if existing_doc is not None and existing_doc.id != command.id:
                raise ErrorHandler(ErrorType.SOCIO_ALREADY_EXISTS)
            socio.documento = command.documento
        if command.email is not None:
            existing_email = self.socio_repository.get_by_email(command.email)
            if existing_email is not None and existing_email.id != command.id:
                raise ErrorHandler(ErrorType.SOCIO_ALREADY_EXISTS)
            socio.email = command.email
        if command.telefono is not None:
            socio.telefono = command.telefono

        updated = self.socio_repository.update(command.id, socio)
        if updated is None:
            raise ErrorHandler(ErrorType.SOCIO_NOT_FOUND)

        return UpdateSocioUseCase.Result(socio=updated)
