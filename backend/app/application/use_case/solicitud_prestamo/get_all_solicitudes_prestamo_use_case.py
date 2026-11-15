from dataclasses import dataclass
from typing import List, Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.rol import Rol
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.repository.solicitud_prestamo_repository_i import SolicitudPrestamoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class GetAllSolicitudesPrestamoUseCase:
    def __init__(
        self,
        solicitud_repository: SolicitudPrestamoRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.solicitud_repository = solicitud_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        tipo: Optional[TipoPrestamo] = None
        estado: Optional[EstadoSolicitud] = None
        sede_id: Optional[int] = None

    @dataclass(frozen=True)
    class Result:
        solicitudes: List[SolicitudPrestamo]

    def execute(self, command: Command) -> Result:
        user = AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.RECEPCIONISTA,
        )
        sede_id = user.resolve_sede_filter(command.sede_id)
        solicitudes = self.solicitud_repository.get_all_filtered(
            tipo=command.tipo,
            estado=command.estado,
            sede_id=sede_id,
        )
        return GetAllSolicitudesPrestamoUseCase.Result(solicitudes=solicitudes)
