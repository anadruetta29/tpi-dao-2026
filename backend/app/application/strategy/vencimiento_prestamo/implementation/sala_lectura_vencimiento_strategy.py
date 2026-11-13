from datetime import date
from app.application.strategy.vencimiento_prestamo.core.vencimiento_prestamo_strategy import (
    VencimientoPrestamoStrategy,
)


class SalaLecturaVencimientoStrategy(VencimientoPrestamoStrategy):
    def calcular_vencimiento(self, fecha_inicio: date) -> date:
        return fecha_inicio
