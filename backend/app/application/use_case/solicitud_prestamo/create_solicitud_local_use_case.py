from dataclasses import dataclass
from typing import Optional
from app.application.strategy.ejemplar_estado.core.ejemplar_estado_state_factory import (
    EjemplarEstadoStateFactory,
)
from app.application.strategy.solicitud_tipo.core.solicitud_tipo_strategy_factory import (
    SolicitudTipoStrategyFactory,
)
from app.core.helper.auth_helper import AuthHelper
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


class CreateSolicitudLocalUseCase:
    def __init__(
        self,
        solicitud_repository: SolicitudPrestamoRepositoryI,
        socio_repository: SocioRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        sede_repository: SedeRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        solicitud_tipo_factory: Optional[SolicitudTipoStrategyFactory] = None,
        ejemplar_state_factory: Optional[EjemplarEstadoStateFactory] = None,
    ) -> None:
        self.solicitud_repository = solicitud_repository
        self.socio_repository = socio_repository
        self.ejemplar_repository = ejemplar_repository
        self.sede_repository = sede_repository
        self.usuario_repository = usuario_repository
        self.solicitud_tipo_factory = solicitud_tipo_factory or SolicitudTipoStrategyFactory()
        self.ejemplar_state_factory = ejemplar_state_factory or EjemplarEstadoStateFactory()

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        socio_id: Optional[int]
        ejemplar_id: Optional[int]
        sede_origen_id: Optional[int]

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
        if command.socio_id is None or command.ejemplar_id is None or command.sede_origen_id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        socio = self.socio_repository.get_by_id(command.socio_id)
        if socio is None:
            raise ErrorHandler(ErrorType.SOCIO_NOT_FOUND)
        socio.validar_habilitado()

        strategy = self.solicitud_tipo_factory.get_strategy(TipoPrestamo.LOCAL)
        sede_destino_id = strategy.validar_sedes(
            command.sede_origen_id, command.sede_origen_id, self.sede_repository
        )

        ejemplar = self.ejemplar_repository.get_by_id(command.ejemplar_id)
        if ejemplar is None:
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
        self.ejemplar_state_factory.get_state(ejemplar.estado).validar_prestamo(ejemplar)
        ejemplar.validar_en_sede(
            command.sede_origen_id, "El ejemplar no pertenece a la sede indicada."
        )

        solicitud = strategy.construir_solicitud(
            socio_id=command.socio_id,
            ejemplar_id=command.ejemplar_id,
            sede_origen_id=command.sede_origen_id,
            sede_destino_id=sede_destino_id,
            responsable_origen_id=user.id,
        )
        saved = self.solicitud_repository.save(solicitud)
        return CreateSolicitudLocalUseCase.Result(solicitud=saved)
