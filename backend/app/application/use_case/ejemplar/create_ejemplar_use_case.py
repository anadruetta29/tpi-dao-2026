from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_sede import EstadoSede
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.libro_repository_i import LibroRepositoryI
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreateEjemplarUseCase:
    def __init__(
        self,
        ejemplar_repository: EjemplarRepositoryI,
        libro_repository: LibroRepositoryI,
        sede_repository: SedeRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.ejemplar_repository = ejemplar_repository
        self.libro_repository = libro_repository
        self.sede_repository = sede_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        codigo: Optional[str]
        libro_id: Optional[int]
        sede_id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        ejemplar: Ejemplar

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        if not command.codigo or command.libro_id is None or command.sede_id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        if self.ejemplar_repository.get_by_codigo(command.codigo) is not None:
            raise ErrorHandler(ErrorType.EJEMPLAR_ALREADY_EXISTS)

        if self.libro_repository.get_by_id(command.libro_id) is None:
            raise ErrorHandler(ErrorType.LIBRO_NOT_FOUND)

        sede = self.sede_repository.get_by_id(command.sede_id)
        if sede is None:
            raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)
        if sede.estado == EstadoSede.BAJA:
            raise ErrorHandler(ErrorType.SEDE_INACTIVE)

        ejemplar = Ejemplar(
            codigo=command.codigo,
            estado=EstadoEjemplar.DISPONIBLE,
            libro_id=command.libro_id,
            sede_id=command.sede_id,
        )
        saved = self.ejemplar_repository.save(ejemplar)
        return CreateEjemplarUseCase.Result(ejemplar=saved)
