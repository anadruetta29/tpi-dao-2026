from contextlib import nullcontext
from dataclasses import dataclass
from datetime import date
from typing import Callable, ContextManager, Optional
from app.application.strategy.devolucion_ejemplar.core.devolucion_ejemplar_strategy_factory import (
    DevolucionEjemplarStrategyFactory,
)
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.devolucion import Devolucion
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.prestamo import Prestamo
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.devolucion_repository_i import DevolucionRepositoryI
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.multa_repository_i import MultaRepositoryI
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreateDevolucionUseCase:
    def __init__(
        self,
        devolucion_repository: DevolucionRepositoryI,
        prestamo_repository: PrestamoRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        reserva_repository: Optional[ReservaRepositoryI] = None,
        multa_repository: Optional[MultaRepositoryI] = None,
        socio_repository: Optional[SocioRepositoryI] = None,
        devolucion_strategy_factory: Optional[DevolucionEjemplarStrategyFactory] = None,
        transaction: Callable[[], ContextManager] = nullcontext,
    ) -> None:
        self.devolucion_repository = devolucion_repository
        self.prestamo_repository = prestamo_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository
        self.reserva_repository = reserva_repository
        self.multa_repository = multa_repository
        self.socio_repository = socio_repository
        self.transaction = transaction
        self.devolucion_strategy_factory = (
            devolucion_strategy_factory or DevolucionEjemplarStrategyFactory()
        )

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        prestamo_id: Optional[int]
        fecha: Optional[date]
        observaciones: Optional[str]
        estadoDevuelto: Optional[EstadoEjemplar]
        anticipada: bool = False

    @dataclass(frozen=True)
    class Result:
        devolucion: Devolucion
        prestamo: Prestamo

    def execute(self, command: Command) -> Result:
        with self.transaction():
            return self._execute(command)

    def _execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        if command.prestamo_id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        prestamo = self.prestamo_repository.get_by_id_for_update(command.prestamo_id)
        if prestamo is None:
            raise ErrorHandler(ErrorType.PRESTAMO_NOT_FOUND)
        prestamo.validar_no_devuelto()

        fecha_dev = command.fecha or date.today()
        if command.anticipada:
            prestamo.validar_cancelacion_anticipada(fecha_dev)
        estado_devuelto = command.estadoDevuelto or EstadoEjemplar.DISPONIBLE

        ejemplar = (
            self.ejemplar_repository.get_by_id(prestamo.ejemplar_id)
            if prestamo.ejemplar_id is not None
            else None
        )
        if command.anticipada and (ejemplar is None or ejemplar.id is None):
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
        strategy = self.devolucion_strategy_factory.get_strategy(estado_devuelto)
        strategy.procesar_devolucion(
            prestamo=prestamo,
            ejemplar=ejemplar,
            fecha_devolucion=fecha_dev,
            estado_devuelto=estado_devuelto,
            ejemplar_repository=self.ejemplar_repository,
            reserva_repository=self.reserva_repository,
            multa_repository=self.multa_repository,
            socio_repository=self.socio_repository,
        )

        prestamo.marcar_devuelto(fecha_dev)
        updated = self.prestamo_repository.update(command.prestamo_id, prestamo)
        if updated is None:
            raise ErrorHandler(ErrorType.PRESTAMO_NOT_FOUND)

        devolucion = Devolucion(
            fecha=fecha_dev,
            observaciones=command.observaciones,
            estadoDevuelto=estado_devuelto,
            prestamo_id=prestamo.id,
        )
        saved = self.devolucion_repository.save(devolucion)
        return CreateDevolucionUseCase.Result(devolucion=saved, prestamo=updated)
