from datetime import date
from app.application.state.multa.core.multa import (
    MultaEstadoState,
)
from app.domain.entity.multa import Multa


class PendienteMultaState(MultaEstadoState):
    def pagar(self, multa: Multa, fecha_pago: date) -> None:
        multa.pagar(fecha_pago)

    def anular(self, multa: Multa) -> None:
        multa.anular()
