from datetime import date, timedelta
from typing import Optional
from app.application.strategy.reserva_estado.core.reserva_estado_state_factory import ReservaEstadoStateFactory
from app.core.config.settings import settings
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.reserva import Reserva
from app.domain.repository.reserva_repository_i import ReservaRepositoryI


def asignar_reserva(
    ejemplar: Ejemplar,
    reserva_repository: ReservaRepositoryI,
    fecha: date,
    dias_retiro: Optional[int] = None,
) -> Optional[Reserva]:
    if ejemplar.id is None or ejemplar.libro_id is None or ejemplar.estado != EstadoEjemplar.DISPONIBLE:
        return None

    pendientes = reserva_repository.get_pendientes_for_update(ejemplar.libro_id, ejemplar.sede_id, ejemplar.id)
    if not pendientes:
        return None

    reserva = pendientes[0]
    ReservaEstadoStateFactory().get_state(reserva.estado).atender(reserva)
    reserva.ejemplar_id = ejemplar.id
    reserva.sede_id = ejemplar.sede_id
    plazo = settings.RESERVA_DIAS_RETIRO if dias_retiro is None else dias_retiro
    reserva.fecha_limite_retiro = max(fecha, date.today()) + timedelta(days=plazo)
    actualizada = reserva_repository.update(reserva.id, reserva)
    if actualizada is not None:
        ejemplar.reservar()
    return actualizada
