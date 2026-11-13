from datetime import date, timedelta
from app.application.strategy.vencimiento_prestamo.core.vencimiento_prestamo_strategy import (
    VencimientoPrestamoStrategy,
)


class DomicilioVencimientoStrategy(VencimientoPrestamoStrategy):
    def __init__(self, dias_prestamo: int = 14) -> None:
        self.dias_prestamo = dias_prestamo

    def calcular_vencimiento(self, fecha_inicio: date) -> date:
        return fecha_inicio + timedelta(days=self.dias_prestamo)
