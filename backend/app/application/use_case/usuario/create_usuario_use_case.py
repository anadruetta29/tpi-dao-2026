from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.core.helper.password_helper import PasswordHelper
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreateUsuarioUseCase:
    def __init__(
        self, usuario_repository: UsuarioRepositoryI, sede_repository: SedeRepositoryI
    ) -> None:
        self.usuario_repository = usuario_repository
        self.sede_repository = sede_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        nombre: Optional[str]
        apellido: Optional[str]
        email: Optional[str]
        password: Optional[str]
        role: Optional[Rol]
        sede_id: Optional[int] = None

    @dataclass(frozen=True)
    class Result:
        usuario: Usuario

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(command.token, self.usuario_repository, Rol.ADMIN)

        if (
            not command.nombre
            or not command.apellido
            or not command.email
            or not command.password
            or command.role is None
        ):
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        if self.usuario_repository.get_by_email(command.email) is not None:
            raise ErrorHandler(ErrorType.USER_ALREADY_EXISTS)

        sede_id = None
        if command.role == Rol.RECEPCIONISTA:
            sede_id = command.sede_id
            if sede_id is None:
                raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS, "Seleccioná la sede del recepcionista.")
            if self.sede_repository.get_by_id(sede_id) is None:
                raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)

        usuario = Usuario(
            nombre=command.nombre,
            apellido=command.apellido,
            email=command.email,
            password=PasswordHelper.hash(command.password),
            activo=True,
            role=command.role,
            sede_id=sede_id,
        )
        saved = self.usuario_repository.save(usuario)
        return CreateUsuarioUseCase.Result(usuario=saved)
