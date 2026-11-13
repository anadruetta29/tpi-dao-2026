from typing import Dict
from app.application.strategy.devolucion_ejemplar.core.devolucion_ejemplar_strategy import (
    DevolucionEjemplarStrategy,
)
from app.application.strategy.devolucion_ejemplar.implementation.devolucion_con_incidencia_strategy import (
    DevolucionConIncidenciaStrategy,
)
from app.application.strategy.devolucion_ejemplar.implementation.devolucion_disponible_strategy import (
    DevolucionDisponibleStrategy,
)
from app.domain.entity.estado_ejemplar import EstadoEjemplar


class DevolucionEjemplarStrategyFactory:
    def __init__(self) -> None:
        disponible = DevolucionDisponibleStrategy()
        con_incidencia = DevolucionConIncidenciaStrategy()
        self._strategies: Dict[EstadoEjemplar, DevolucionEjemplarStrategy] = {
            EstadoEjemplar.DISPONIBLE: disponible,
            EstadoEjemplar.DANADO: con_incidencia,
            EstadoEjemplar.EXTRAVIADO: con_incidencia,
            EstadoEjemplar.DESTRUIDO: con_incidencia,
            EstadoEjemplar.EN_REVISION: con_incidencia,
        }
        self._default_strategy: DevolucionEjemplarStrategy = con_incidencia

    def get_strategy(
        self, estado_devuelto: EstadoEjemplar
    ) -> DevolucionEjemplarStrategy:
        return self._strategies.get(estado_devuelto, self._default_strategy)
