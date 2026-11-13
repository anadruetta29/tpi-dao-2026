from dataclasses import dataclass
from typing import Optional
from uuid import uuid4
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_sede import EstadoSede
from app.domain.entity.estado_socio import EstadoSocio
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.rol import Rol
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.solicitud_prestamo_repository_i import SolicitudPrestamoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreateSolicitudInterbibliotecariaUseCase:
    def __init__(
        self,
        solicitud_repository: SolicitudPrestamoRepositoryI,
        socio_repository: SocioRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        sede_repository: SedeRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.solicitud_repository = solicitud_repository
        self.socio_repository = socio_repository
        self.ejemplar_repository = ejemplar_repository
        self.sede_repository = sede_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        socio_id: Optional[int]
        ejemplar_id: Optional[int]
        sede_origen_id: Optional[int]
        sede_destino_id: Optional[int]

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
        if (
            command.socio_id is None
            or command.ejemplar_id is None
            or command.sede_origen_id is None
            or command.sede_destino_id is None
        ):
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        socio = self.socio_repository.get_by_id(command.socio_id)
        if socio is None:
            raise ErrorHandler(ErrorType.SOCIO_NOT_FOUND)
        if socio.estado == EstadoSocio.INHABILITADO:
            raise ErrorHandler(ErrorType.SOCIO_INHABILITADO)

        sede_origen = self.sede_repository.get_by_id(command.sede_origen_id)
        if sede_origen is None:
            raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)
        if sede_origen.estado == EstadoSede.BAJA:
            raise ErrorHandler(ErrorType.SEDE_INACTIVE)

        sede_destino = self.sede_repository.get_by_id(command.sede_destino_id)
        if sede_destino is None:
            raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)
        if sede_destino.estado == EstadoSede.BAJA:
            raise ErrorHandler(ErrorType.SEDE_INACTIVE)

        ejemplar = self.ejemplar_repository.get_by_id(command.ejemplar_id)
        if ejemplar is None:
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
        if ejemplar.estado != EstadoEjemplar.DISPONIBLE:
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_AVAILABLE)
        if ejemplar.sede_id != command.sede_origen_id:
            raise ErrorHandler(ErrorType.BAD_REQUEST, "El ejemplar no pertenece a la sede de origen.")

        solicitud = SolicitudPrestamo(
            numero=f"SOL-{uuid4().hex[:8].upper()}",
            tipo=TipoPrestamo.INTERBIBLIOTECARIO,
            estado=EstadoSolicitud.PENDIENTE,
            socio_id=command.socio_id,
            ejemplar_id=command.ejemplar_id,
            sede_origen_id=command.sede_origen_id,
            sede_destino_id=command.sede_destino_id,
            responsable_origen_id=user.id,
        )
        saved = self.solicitud_repository.save(solicitud)
        return CreateSolicitudInterbibliotecariaUseCase.Result(solicitud=saved)
