from datetime import date
from typing import Optional
from app.application.strategy.devolucion_ejemplar.core.devolucion_ejemplar_strategy import (
    DevolucionEjemplarStrategy,
)
from app.application.state.ejemplar.core.ejemplar_factory import (
    EjemplarEstadoStateFactory,
)
from app.application.use_case.reserva.asignar_reserva_use_case import asignar_reserva
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar

from app.domain.entity.prestamo import Prestamo
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.multa_repository_i import MultaRepositoryI
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.tarifa_multa_repository_i import TarifaMultaRepositoryI


class DevolucionDisponibleStrategy(DevolucionEjemplarStrategy):
    def procesar_devolucion(
        self,
        prestamo: Prestamo,
        ejemplar: Optional[Ejemplar],
        fecha_devolucion: date,
        estado_devuelto: EstadoEjemplar,
        ejemplar_repository: EjemplarRepositoryI,
        reserva_repository: Optional[ReservaRepositoryI] = None,
        multa_repository: Optional[MultaRepositoryI] = None,
        socio_repository: Optional[SocioRepositoryI] = None,
        fecha_atraso: Optional[date] = None,
        tarifa_multa_repository: Optional[TarifaMultaRepositoryI] = None,
    ) -> None:
        self._verificar_entrega_tardia(
            prestamo, fecha_atraso or fecha_devolucion, multa_repository, socio_repository, tarifa_multa_repository
        )

        if ejemplar is None or ejemplar.id is None:
            return

        EjemplarEstadoStateFactory().get_state(ejemplar.estado).devolver(
            ejemplar, EstadoEjemplar.DISPONIBLE
        )

        if reserva_repository is not None:
            asignar_reserva(ejemplar, reserva_repository, fecha_devolucion)

        ejemplar_repository.update(ejemplar.id, ejemplar)
