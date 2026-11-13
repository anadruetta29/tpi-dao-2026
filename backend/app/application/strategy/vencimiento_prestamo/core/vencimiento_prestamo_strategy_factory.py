from typing import Dict
from app.application.strategy.vencimiento_prestamo.core.vencimiento_prestamo_strategy import (
    VencimientoPrestamoStrategy,
)
from app.application.strategy.vencimiento_prestamo.implementation.domicilio_vencimiento_strategy import (
    DomicilioVencimientoStrategy,
)
from app.application.strategy.vencimiento_prestamo.implementation.sala_lectura_vencimiento_strategy import (
    SalaLecturaVencimientoStrategy,
)
from app.domain.entity.modalidad_prestamo_local import ModalidadPrestamoLocal
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class VencimientoPrestamoStrategyFactory:
    def __init__(self) -> None:
        self._strategies: Dict[ModalidadPrestamoLocal, VencimientoPrestamoStrategy] = {
            ModalidadPrestamoLocal.DOMICILIO: DomicilioVencimientoStrategy(),
            ModalidadPrestamoLocal.SALA_LECTURA: SalaLecturaVencimientoStrategy(),
        }

    def get_strategy(
        self, modalidad: ModalidadPrestamoLocal
    ) -> VencimientoPrestamoStrategy:
        strategy = self._strategies.get(modalidad)
        if strategy is None:
            raise ErrorHandler(ErrorType.BAD_REQUEST, "Modalidad de préstamo no soportada.")
        return strategy
