from contextlib import nullcontext
from dataclasses import dataclass
from datetime import date
from typing import Callable, ContextManager, List, Optional
from uuid import uuid4
from app.application.state.ejemplar.core.ejemplar_factory import (
    EjemplarEstadoStateFactory,
)
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.historial_estado_remito import HistorialEstadoRemito
from app.domain.entity.remito import Remito
from app.domain.entity.rol import Rol
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.historial_estado_remito_repository_i import HistorialEstadoRemitoRepositoryI
from app.domain.repository.remito_repository_i import RemitoRepositoryI
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreateRemitoUseCase:
    def __init__(
        self,
        remito_repository: RemitoRepositoryI,
        historial_repository: HistorialEstadoRemitoRepositoryI,
        sede_repository: SedeRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        ejemplar_state_factory: Optional[EjemplarEstadoStateFactory] = None,
        transaction: Callable[[], ContextManager] = nullcontext,
    ) -> None:
        self.remito_repository = remito_repository
        self.historial_repository = historial_repository
        self.sede_repository = sede_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository
        self.transaction = transaction
        self.ejemplar_state_factory = ejemplar_state_factory or EjemplarEstadoStateFactory()

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        sede_origen_id: Optional[int]
        sede_destino_id: Optional[int]
        ejemplar_ids: List[int]
        fechaEmision: Optional[date]

    @dataclass(frozen=True)
    class Result:
        remito: Remito

    def execute(self, command: Command) -> Result:
        with self.transaction():
            user = AuthHelper.authenticate(
                command.token,
                self.usuario_repository,
                Rol.ADMIN,
                Rol.RECEPCIONISTA,
            )
            return CreateRemitoUseCase.Result(remito=self._emitir(command, user))

    def existe_para_solicitud(self, solicitud_id: int) -> bool:
        return self.remito_repository.get_by_solicitud_id(solicitud_id) is not None

    def emitir_para_solicitud(self, solicitud: SolicitudPrestamo, user: Usuario) -> Remito:
        return self._emitir(
            self.Command(None, solicitud.sede_origen_id, solicitud.sede_destino_id, solicitud.ejemplar_ids, None),
            user,
            solicitud.id,
        )

    def _emitir(self, command: Command, user: Usuario, solicitud_id: Optional[int] = None) -> Remito:
        user.validar_sede(command.sede_origen_id)
        if (
            command.sede_origen_id is None
            or command.sede_destino_id is None
            or not command.ejemplar_ids
        ):
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        sede_origen = self.sede_repository.get_by_id(command.sede_origen_id)
        if sede_origen is None:
            raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)
        sede_origen.validar_activa()

        sede_destino = self.sede_repository.get_by_id(command.sede_destino_id)
        if sede_destino is None:
            raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)
        sede_destino.validar_activa()

        fecha_emision = command.fechaEmision or date.today()
        if fecha_emision > date.today():
            raise ErrorHandler(ErrorType.BAD_REQUEST, "La fecha de emisión no puede ser posterior a hoy.")

        ejemplar_ids = sorted(set(command.ejemplar_ids))
        for ej_id in ejemplar_ids:
            ejemplar = self.ejemplar_repository.get_by_id_for_update(ej_id)
            if ejemplar is None:
                raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
            ejemplar.validar_en_sede(command.sede_origen_id)
            self.ejemplar_state_factory.get_state(ejemplar.estado).validar_envio(ejemplar)
            if solicitud_id is not None:
                ejemplar.reservar()
                self.ejemplar_repository.update(ej_id, ejemplar)

        remito = Remito(
            numero=f"REM-{uuid4().hex[:8].upper()}",
            fechaEmision=fecha_emision,
            sede_origen_id=command.sede_origen_id,
            sede_destino_id=command.sede_destino_id,
            ejemplar_ids=ejemplar_ids,
            solicitud_id=solicitud_id,
        )
        saved_remito = self.remito_repository.save(remito)

        estado = EstadoEnvio.ACEPTADO if solicitud_id is not None else EstadoEnvio.EMPACADO
        self.historial_repository.save(HistorialEstadoRemito.registrar(estado, saved_remito.id, fecha_emision, user))
        return saved_remito
