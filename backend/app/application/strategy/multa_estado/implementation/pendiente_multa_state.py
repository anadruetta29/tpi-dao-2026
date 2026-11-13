from datetime import date
from app.application.strategy.multa_estado.core.multa_estado_state import (
    MultaEstadoState,
)
from app.domain.entity.multa import Multa


class PendienteMultaState(MultaEstadoState):
    def pagar(self, multa: Multa, fecha_pago: date) -> None:
        multa.pagar(fecha_pago)

    def anular(self, multa: Multa) -> None:
        multa.anular()
