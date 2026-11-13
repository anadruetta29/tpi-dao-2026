from dataclasses import dataclass
from datetime import date
from typing import Optional
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.devolucion import Devolucion
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.rol import Rol
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.devolucion_repository_i import DevolucionRepositoryI
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.usuario_repository_i import UsuarioRepositoryI


class CreateDevolucionUseCase:
    def __init__(
        self,
        devolucion_repository: DevolucionRepositoryI,
        prestamo_repository: PrestamoRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        usuario_repository: UsuarioRepositoryI,
    ) -> None:
        self.devolucion_repository = devolucion_repository
        self.prestamo_repository = prestamo_repository
        self.ejemplar_repository = ejemplar_repository
        self.usuario_repository = usuario_repository

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        prestamo_id: Optional[int]
        fecha: Optional[date]
        observaciones: Optional[str]
        estadoDevuelto: Optional[EstadoEjemplar]

    @dataclass(frozen=True)
    class Result:
        devolucion: Devolucion

    def execute(self, command: Command) -> Result:
        AuthHelper.authenticate(
            command.token,
            self.usuario_repository,
            Rol.ADMIN,
            Rol.MODERADOR,
            Rol.RECEPCIONISTA,
        )
        if command.prestamo_id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)

        prestamo = self.prestamo_repository.get_by_id(command.prestamo_id)
        if prestamo is None:
            raise ErrorHandler(ErrorType.PRESTAMO_NOT_FOUND)
        if prestamo.estado == EstadoPrestamo.DEVUELTO:
            raise ErrorHandler(ErrorType.PRESTAMO_ALREADY_RETURNED)

        fecha_dev = command.fecha or date.today()
        estado_devuelto = command.estadoDevuelto or EstadoEjemplar.DISPONIBLE

        prestamo.estado = EstadoPrestamo.DEVUELTO
        prestamo.fechaDevolucion = fecha_dev
        self.prestamo_repository.update(prestamo.id, prestamo)

        if prestamo.ejemplar_id is not None:
            ejemplar = self.ejemplar_repository.get_by_id(prestamo.ejemplar_id)
            if ejemplar is not None and ejemplar.id is not None:
                ejemplar.estado = estado_devuelto
                self.ejemplar_repository.update(ejemplar.id, ejemplar)

        devolucion = Devolucion(
            fecha=fecha_dev,
            observaciones=command.observaciones,
            estadoDevuelto=estado_devuelto,
            prestamo_id=prestamo.id,
        )
        saved = self.devolucion_repository.save(devolucion)
        return CreateDevolucionUseCase.Result(devolucion=saved)
