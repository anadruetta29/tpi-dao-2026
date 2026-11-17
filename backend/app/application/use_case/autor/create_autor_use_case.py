from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.autor import Autor
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.autor_repository_i import AutorRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


def validar_autor_unico(
    autor_repository: AutorRepositoryI,
    nombre: str,
    apellido: str,
    exclude_id: Optional[int] = None,
) -> None:
    """Rejects duplicate author names (case- and whitespace-insensitive)."""
    nombre_normalizado = nombre.casefold()
    apellido_normalizado = apellido.casefold()
    for existente in autor_repository.get_all():
        if exclude_id is not None and existente.id == exclude_id:
            continue
        if (
            (existente.nombre or "").strip().casefold() == nombre_normalizado
            and (existente.apellido or "").strip().casefold() == apellido_normalizado
        ):
            raise ErrorHandler(
                ErrorType.CONFLICT,
                "Ya existe un autor con ese nombre y apellido.",
            )


class CreateAutorUseCase:
    def __init__(
        self,
        autor_repository: AutorRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.autor_repository = autor_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        nombre: Optional[str]
        apellido: Optional[str]

    @dataclass(frozen=True)
    class Result:
        autor: Autor

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.RECEPCIONISTA,
        )
        nombre = (command.nombre or "").strip()
        apellido = (command.apellido or "").strip()
        if not nombre or not apellido:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        validar_autor_unico(self.autor_repository, nombre, apellido)

        autor = Autor(nombre=nombre, apellido=apellido)
        saved = self.autor_repository.save(autor)
        return CreateAutorUseCase.Result(autor=saved)
