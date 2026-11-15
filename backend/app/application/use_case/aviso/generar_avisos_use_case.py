from datetime import date, timedelta
from typing import Callable, ContextManager
from app.core.config.settings import settings
from app.domain.entity.aviso import Aviso
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.repository.aviso_repository_i import AvisoRepositoryI
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.reserva_repository_i import ReservaRepositoryI


class GenerarAvisosUseCase:
    def __init__(
        self,
        avisos: AvisoRepositoryI,
        reservas: ReservaRepositoryI,
        prestamos: PrestamoRepositoryI,
        transaction: Callable[[], ContextManager],
    ) -> None:
        self.avisos = avisos
        self.reservas = reservas
        self.prestamos = prestamos
        self.transaction = transaction

    def execute(self, hoy: date) -> None:
        with self.transaction():
            for reserva in self.reservas.get_all_filtered(estado=EstadoReserva.LISTA_PARA_RETIRO):
                if reserva.fecha_limite_retiro is None or reserva.fecha_limite_retiro < hoy:
                    continue
                self.avisos.crear_si_nuevo(Aviso(
                    clave=f"reserva-lista:{reserva.id}", tipo="RESERVA_LISTA",
                    mensaje=f"La reserva #{reserva.id} está lista en la sede #{reserva.sede_id}. Podés retirarla hasta el {reserva.fecha_limite_retiro:%d/%m/%Y}.",
                    fecha=hoy, sede_id=reserva.sede_id, socio_id=reserva.socio_id, reserva_id=reserva.id,
                ))

            prestamos = self.prestamos.get_all_filtered(estado=EstadoPrestamo.ACTIVO)
            prestamos += self.prestamos.get_all_filtered(estado=EstadoPrestamo.VENCIDO)
            for prestamo in prestamos:
                vencimiento = prestamo._fecha_vencimiento_as_date()
                if vencimiento is None or prestamo.fechaDevolucion is not None:
                    continue
                if vencimiento < hoy:
                    tipo = "PRESTAMO_ATRASADO"
                    mensaje = f"El préstamo #{prestamo.id} venció el {vencimiento:%d/%m/%Y} y sigue pendiente de devolución."
                elif vencimiento <= hoy + timedelta(days=settings.AVISO_DIAS_ANTICIPACION):
                    tipo = "PRESTAMO_POR_VENCER"
                    mensaje = f"El préstamo #{prestamo.id} vence el {vencimiento:%d/%m/%Y}."
                else:
                    continue
                self.avisos.crear_si_nuevo(Aviso(
                    clave=f"{tipo}:{prestamo.id}:{vencimiento}", tipo=tipo, mensaje=mensaje,
                    fecha=hoy, sede_id=prestamo.sede_id, socio_id=prestamo.socio_id, prestamo_id=prestamo.id,
                ))
