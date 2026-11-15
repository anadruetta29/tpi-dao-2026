from dataclasses import dataclass
from typing import List, Optional
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
from app.domain.repository.solicitud_prestamo_repository_i import SolicitudPrestamoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreateSolicitudInterbibliotecariaUseCase:
    def __init__(
        self,
        solicitud_repository: SolicitudPrestamoRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        sede_repository: SedeRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        solicitud_tipo_factory: Optional[SolicitudTipoStrategyFactory] = None,
        ejemplar_state_factory: Optional[EjemplarEstadoStateFactory] = None,
    ) -> None:
        self.solicitud_repository = solicitud_repository
        self.ejemplar_repository = ejemplar_repository
        self.sede_repository = sede_repository
        self.usuario_repository = usuario_repository
        self.solicitud_tipo_factory = solicitud_tipo_factory or SolicitudTipoStrategyFactory()
        self.ejemplar_state_factory = ejemplar_state_factory or EjemplarEstadoStateFactory()

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        recepcionista_id: Optional[int]
        ejemplar_id: Optional[int]
        sede_origen_id: Optional[int]
        sede_destino_id: Optional[int]
        ejemplar_ids: Optional[List[int]] = None

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
        ejemplar_ids = command.ejemplar_ids or ([command.ejemplar_id] if command.ejemplar_id is not None else [])
        if (
            command.recepcionista_id is None
            or not ejemplar_ids
            or command.sede_origen_id is None
            or command.sede_destino_id is None
        ):
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        user.validar_sede(command.sede_origen_id, command.sede_destino_id)
        recepcionista = self.usuario_repository.get_by_id(command.recepcionista_id)
        if (
            recepcionista is None
            or not recepcionista.activo
            or recepcionista.role not in (Rol.RECEPCIONISTA, Rol.ADMIN)
            or (recepcionista.role == Rol.RECEPCIONISTA and recepcionista.sede_id != command.sede_origen_id)
        ):
            raise ErrorHandler(ErrorType.RECEPCIONISTA_INVALIDO, "Seleccioná un recepcionista activo de la sede de origen.")

        strategy = self.solicitud_tipo_factory.get_strategy(TipoPrestamo.INTERBIBLIOTECARIO)
        sede_destino_id = strategy.validar_sedes(
            command.sede_origen_id, command.sede_destino_id, self.sede_repository
        )

        for ejemplar_id in ejemplar_ids:
            ejemplar = self.ejemplar_repository.get_by_id(ejemplar_id)
            if ejemplar is None:
                raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
            self.ejemplar_state_factory.get_state(ejemplar.estado).validar_prestamo(ejemplar)
            ejemplar.validar_en_sede(command.sede_origen_id)

        solicitud = strategy.construir_solicitud(
            socio_id=None,
            ejemplar_id=ejemplar_ids[0],
            sede_origen_id=command.sede_origen_id,
            sede_destino_id=sede_destino_id,
            responsable_origen_id=command.recepcionista_id,
        )
        solicitud.ejemplar_ids = ejemplar_ids
        saved = self.solicitud_repository.save(solicitud)
        return CreateSolicitudInterbibliotecariaUseCase.Result(solicitud=saved)
