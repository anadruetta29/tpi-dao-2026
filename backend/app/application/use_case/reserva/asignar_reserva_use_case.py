from datetime import date, timedelta
from typing import Optional
from app.application.state.reserva.core.reserva_factory import ReservaEstadoStateFactory
from app.core.config.settings import settings
from app.domain.entity.aviso import Aviso
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.reserva import Reserva
from app.domain.repository.aviso_repository_i import AvisoRepositoryI
from app.domain.repository.reserva_repository_i import ReservaRepositoryI


def registrar_aviso_reserva_lista(
    reserva: Reserva,
    aviso_repository: Optional[AvisoRepositoryI],
    fecha: date,
) -> None:
    if aviso_repository is None or reserva.id is None or reserva.fecha_limite_retiro is None:
        return
    aviso_repository.crear_si_nuevo(Aviso(
        clave=f"reserva-lista:{reserva.id}",
        tipo="RESERVA_LISTA",
        mensaje=(
            f"La reserva #{reserva.id} está lista en la sede #{reserva.sede_id}. "
            f"Podés retirarla hasta el {reserva.fecha_limite_retiro:%d/%m/%Y}."
        ),
        fecha=fecha,
        sede_id=reserva.sede_id,
        socio_id=reserva.socio_id,
        reserva_id=reserva.id,
    ))


def asignar_reserva(
    ejemplar: Ejemplar,
    reserva_repository: ReservaRepositoryI,
    fecha: date,
    dias_retiro: Optional[int] = None,
    aviso_repository: Optional[AvisoRepositoryI] = None,
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
    hoy = max(fecha, date.today())
    reserva.fecha_limite_retiro = hoy + timedelta(days=plazo)
    actualizada = reserva_repository.update(reserva.id, reserva)
    if actualizada is not None:
        ejemplar.reservar()
        registrar_aviso_reserva_lista(actualizada, aviso_repository, hoy)
    return actualizada
