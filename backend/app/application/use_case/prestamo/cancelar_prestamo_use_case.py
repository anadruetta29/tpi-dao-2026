from dataclasses import dataclass
from datetime import date
from typing import Optional

from app.application.use_case.devolucion.create_devolucion_use_case import CreateDevolucionUseCase
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.prestamo import Prestamo


class CancelarPrestamoUseCase:
    def __init__(self, devolver: CreateDevolucionUseCase) -> None:
        self.devolver = devolver

    @dataclass(frozen=True)
    class Command:
        token: Optional[str]
        id: int

    @dataclass(frozen=True)
    class Result:
        prestamo: Prestamo

    def execute(self, command: Command) -> Result:
        result = self.devolver.execute(CreateDevolucionUseCase.Command(
            token=command.token,
            prestamo_id=command.id,
            fecha=date.today(),
            observaciones="Cancelación anticipada del préstamo.",
            estadoDevuelto=EstadoEjemplar.DISPONIBLE,
            anticipada=True,
        ))
        return self.Result(prestamo=result.prestamo)
