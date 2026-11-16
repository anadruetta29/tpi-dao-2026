from datetime import date
from app.domain.entity.multa import Multa
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class MultaEstadoState:
    def pagar(self, multa: Multa, fecha_pago: date) -> None:
        raise ErrorHandler(ErrorType.MULTA_ALREADY_CLOSED)

    def anular(self, multa: Multa) -> None:
        raise ErrorHandler(ErrorType.MULTA_ALREADY_CLOSED)
