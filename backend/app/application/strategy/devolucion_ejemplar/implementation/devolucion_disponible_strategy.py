from datetime import date
from typing import Optional
from app.application.strategy.devolucion_ejemplar.core.devolucion_ejemplar_strategy import (
    DevolucionEjemplarStrategy,
)
from app.application.strategy.ejemplar_estado.core.ejemplar_estado_state_factory import (
    EjemplarEstadoStateFactory,
)
from app.application.strategy.reserva_estado.core.reserva_estado_state_factory import (
    ReservaEstadoStateFactory,
)
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.prestamo import Prestamo
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.multa_repository_i import MultaRepositoryI
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI


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
    ) -> None:
        self._verificar_entrega_tardia(
            prestamo, fecha_devolucion, multa_repository, socio_repository
        )

        if ejemplar is None or ejemplar.id is None:
            return

        EjemplarEstadoStateFactory().get_state(ejemplar.estado).devolver(
            ejemplar, EstadoEjemplar.DISPONIBLE
        )

        if reserva_repository is not None and ejemplar.libro_id is not None:
            reservas_activas = reserva_repository.get_all_filtered(
                libro_id=ejemplar.libro_id,
                sede_id=ejemplar.sede_id,
                estado=EstadoReserva.ACTIVA,
            )
            if reservas_activas:
                reserva = reservas_activas[0]
                if reserva.id is not None:
                    ReservaEstadoStateFactory().get_state(reserva.estado).atender(
                        reserva
                    )
                    reserva.ejemplar_id = ejemplar.id
                    reserva_repository.update(reserva.id, reserva)
                    ejemplar.reservar()

        ejemplar_repository.update(ejemplar.id, ejemplar)
