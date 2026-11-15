from dataclasses import dataclass
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.rol import Rol
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.remito_repository_i import RemitoRepositoryI
from app.domain.repository.solicitud_prestamo_repository_i import SolicitudPrestamoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetSolicitudPrestamoByIdUseCase:
    def __init__(
        self,
        solicitud_repository: SolicitudPrestamoRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        prestamo_repository: PrestamoRepositoryI,
        remito_repository: RemitoRepositoryI,
    ) -> None:
        self.solicitud_repository = solicitud_repository
        self.usuario_repository = usuario_repository
        self.prestamo_repository = prestamo_repository
        self.remito_repository = remito_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: Optional[int]

    @dataclass(frozen=True)
    class Result:
        solicitud: SolicitudPrestamo
        aprobacion_completa: Optional[bool]

    def execute(self, command: Command) -> Result:
        usuario = AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.RECEPCIONISTA,
        )
        if command.id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        sede_id = usuario.sede_recepcionista()
        solicitud = self.solicitud_repository.get_by_id(command.id)
        if solicitud is None or (
            sede_id is not None and sede_id not in (solicitud.sede_origen_id, solicitud.sede_destino_id)
        ):
            raise ErrorHandler(ErrorType.SOLICITUD_NOT_FOUND)

        aprobacion_completa = None
        if solicitud.estado == EstadoSolicitud.APROBADA:
            aprobacion_completa = (
                self.prestamo_repository.get_by_solicitud_id(command.id) is not None
                or self.remito_repository.get_by_solicitud_id(command.id) is not None
            )
        return GetSolicitudPrestamoByIdUseCase.Result(solicitud, aprobacion_completa)
