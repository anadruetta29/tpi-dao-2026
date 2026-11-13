from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.rol import Rol
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.solicitud_prestamo_repository_i import SolicitudPrestamoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class UpdateSolicitudEstadoUseCase:
    def __init__(
        self,
        solicitud_repository: SolicitudPrestamoRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.solicitud_repository = solicitud_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]
        estado: Optional[EstadoSolicitud]

    @dataclass(frozen=True)
    class Result:
        solicitud: SolicitudPrestamo

    def execute(self, command: Command) -> Result:
        user = AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        if command.id is None or command.estado is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        solicitud = self.solicitud_repository.get_by_id(command.id)
        if solicitud is None:
            raise ErrorHandler(ErrorType.SOLICITUD_NOT_FOUND)

        if command.estado == EstadoSolicitud.APROBADA and solicitud.ejemplar_id is not None:
            ejemplar = self.ejemplar_repository.get_by_id(solicitud.ejemplar_id)
            if ejemplar is None:
                raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
            if ejemplar.estado != EstadoEjemplar.DISPONIBLE:
                raise ErrorHandler(ErrorType.EJEMPLAR_NOT_AVAILABLE)
            solicitud.responsable_destino_id = user.id

        solicitud.estado = command.estado
        updated = self.solicitud_repository.update(command.id, solicitud)
        if updated is None:
            raise ErrorHandler(ErrorType.SOLICITUD_NOT_FOUND)

        return UpdateSolicitudEstadoUseCase.Result(solicitud=updated)
