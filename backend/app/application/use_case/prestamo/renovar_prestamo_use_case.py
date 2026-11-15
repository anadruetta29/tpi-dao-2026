from dataclasses import dataclass
from datetime import date, timedelta
from typing import Callable, ContextManager, Optional
from app.core.config.settings import settings
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.modalidad_prestamo_local import ModalidadPrestamoLocal
from app.domain.entity.prestamo import Prestamo
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class RenovarPrestamoUseCase:
    def __init__(
        self,
        prestamo_repository: PrestamoRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        reserva_repository: ReservaRepositoryI,
        usuario_repository: UsuarioRepositoryI,
        transaction: Callable[[], ContextManager],
    ) -> None:
        self.prestamo_repository = prestamo_repository
        self.ejemplar_repository = ejemplar_repository
        self.reserva_repository = reserva_repository
        self.usuario_repository = usuario_repository
        self.transaction = transaction

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: int

    @dataclass(frozen=True)
    class Result:
        prestamo: Prestamo

    def execute(self, command: Command) -> Result:
        with self.transaction():
            usuario = AuthHelper.authenticate(
                command.token, self.usuario_repository, Rol.ADMIN, Rol.RECEPCIONISTA,
            )
            prestamo = self.prestamo_repository.get_by_id_for_update(command.id)
            if prestamo is None:
                raise ErrorHandler(ErrorType.PRESTAMO_NOT_FOUND)

            usuario.validar_sede(prestamo.sede_id)
            vencimiento = prestamo._fecha_vencimiento_as_date()
            if (
                prestamo.estado != EstadoPrestamo.ACTIVO or prestamo.fechaDevolucion is not None
                or vencimiento is None or vencimiento < date.today()
                or prestamo.modalidad != ModalidadPrestamoLocal.DOMICILIO
            ):
                raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION, "Solo se pueden renovar préstamos a domicilio activos y al día.")
            if prestamo.renovaciones >= settings.PRESTAMO_MAX_RENOVACIONES:
                raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION, "El préstamo alcanzó el límite de renovaciones.")

            for ejemplar_id in sorted(prestamo.ejemplares_pendientes()):
                ejemplar = self.ejemplar_repository.get_by_id(ejemplar_id)
                if ejemplar is None or ejemplar.libro_id is None:
                    continue
                reservas = self.reserva_repository.get_all_filtered(libro_id=ejemplar.libro_id, estado=EstadoReserva.ACTIVA)
                if any(
                    reserva.sede_id in (None, ejemplar.sede_id) and reserva.ejemplar_id in (None, ejemplar_id)
                    for reserva in reservas
                ):
                    raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION, "Hay una reserva pendiente para un ejemplar del préstamo.")

            prestamo.fechaVencimiento = vencimiento + timedelta(days=settings.PRESTAMO_DIAS_RENOVACION)
            prestamo.renovaciones += 1
            actualizado = self.prestamo_repository.update(command.id, prestamo)
            if actualizado is None:
                raise ErrorHandler(ErrorType.PRESTAMO_NOT_FOUND)
            return self.Result(prestamo=actualizado)
