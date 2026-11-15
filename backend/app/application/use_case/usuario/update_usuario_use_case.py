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


class UpdateUsuarioUseCase:
    def __init__(
        self, usuario_repository: UsuarioRepositoryI, sede_repository: SedeRepositoryI
    ) -> None:
        self.usuario_repository = usuario_repository
        self.sede_repository = sede_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]
        nombre: Optional[str]
        apellido: Optional[str]
        email: Optional[str]
        password: Optional[str]
        activo: Optional[bool]
        role: Optional[Rol]
        sede_id: Optional[int] = None

    @dataclass(frozen=True)
    class Result:
        usuario: Usuario

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(command.token, self.usuario_repository, Rol.ADMIN)

        if command.id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        usuario = self.usuario_repository.get_by_id(command.id)
        if usuario is None:
            raise ErrorHandler(ErrorType.USER_NOT_FOUND)

        role = command.role if command.role is not None else usuario.role
        sede_id = None
        if role == Rol.RECEPCIONISTA:
            sede_id = command.sede_id if command.sede_id is not None else usuario.sede_id
            if sede_id is None:
                raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS, "Seleccioná la sede del recepcionista.")
            if self.sede_repository.get_by_id(sede_id) is None:
                raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)

        if command.nombre is not None:
            usuario.nombre = command.nombre
        if command.apellido is not None:
            usuario.apellido = command.apellido
        if command.email is not None:
            existing = self.usuario_repository.get_by_email(command.email)
            if existing is not None and existing.id != command.id:
                raise ErrorHandler(ErrorType.USER_ALREADY_EXISTS)
            usuario.email = command.email
        if command.password is not None and command.password.strip():
            usuario.password = PasswordHelper.hash(command.password)
        if command.activo is not None:
            usuario.activo = command.activo
        usuario.role = role
        usuario.sede_id = sede_id

        updated = self.usuario_repository.update(command.id, usuario)
        if updated is None:
            raise ErrorHandler(ErrorType.USER_NOT_FOUND)

        return UpdateUsuarioUseCase.Result(usuario=updated)
