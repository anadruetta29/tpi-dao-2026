from datetime import date
from typing import Optional
from app.application.state.reserva.core.reserva_factory import ReservaEstadoStateFactory
from app.application.strategy.vencimiento_prestamo.core.vencimiento_prestamo_strategy_factory import VencimientoPrestamoStrategyFactory
from app.application.helper.asignar_reserva import asignar_reserva
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.modalidad_prestamo_local import ModalidadPrestamoLocal
from app.domain.entity.prestamo import Prestamo
from app.domain.entity.reserva import Reserva
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.aviso_repository_i import AvisoRepositoryI
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.sede_repository_i import SedeRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI


class GestionarRetiroReserva:
    def __init__(
        self,
        reserva_repository: ReservaRepositoryI,
        ejemplar_repository: EjemplarRepositoryI,
        prestamo_repository: PrestamoRepositoryI,
        socio_repository: SocioRepositoryI,
        sede_repository: SedeRepositoryI,
        aviso_repository: Optional[AvisoRepositoryI] = None,
    ) -> None:
        self.reserva_repository = reserva_repository
        self.ejemplar_repository = ejemplar_repository
        self.prestamo_repository = prestamo_repository
        self.socio_repository = socio_repository
        self.sede_repository = sede_repository
        self.aviso_repository = aviso_repository
        self.estado_factory = ReservaEstadoStateFactory()
        self.vencimiento_factory = VencimientoPrestamoStrategyFactory()

    def _get_ejemplar(self, reserva: Reserva) -> Ejemplar:
        if reserva.ejemplar_id is None:
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
        ejemplar = self.ejemplar_repository.get_by_id_for_update(reserva.ejemplar_id)
        if ejemplar is None:
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_FOUND)
        if ejemplar.estado != EstadoEjemplar.RESERVADO or ejemplar.sede_id != reserva.sede_id:
            raise ErrorHandler(ErrorType.EJEMPLAR_NOT_AVAILABLE)
        return ejemplar

    def retirar(self, reserva: Reserva, hoy: date) -> Reserva:
        self.estado_factory.get_state(reserva.estado).retirar(reserva)
        if reserva.fecha_limite_retiro is None or reserva.fecha_limite_retiro < hoy:
            raise ErrorHandler(ErrorType.INVALID_STATE_TRANSITION, "El plazo de retiro de la reserva venció.")
        ejemplar = self._get_ejemplar(reserva)
        socio = self.socio_repository.get_by_id(reserva.socio_id) if reserva.socio_id is not None else None
        if socio is None:
            raise ErrorHandler(ErrorType.SOCIO_NOT_FOUND)
        socio.validar_habilitado()
        sede = self.sede_repository.get_by_id(reserva.sede_id) if reserva.sede_id is not None else None
        if sede is None:
            raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)
        sede.validar_activa()

        modalidad = ModalidadPrestamoLocal.DOMICILIO
        fecha_vencimiento = self.vencimiento_factory.get_strategy(modalidad).calcular_vencimiento(hoy)
        prestamo = self.prestamo_repository.save(Prestamo(
            fechaInicio=hoy,
            fechaVencimiento=fecha_vencimiento,
            estado=EstadoPrestamo.ACTIVO,
            modalidad=modalidad,
            socio_id=reserva.socio_id,
            sede_id=reserva.sede_id,
            ejemplar_id=ejemplar.id,
        ))
        ejemplar.estado = EstadoEjemplar.PRESTADO
        self.ejemplar_repository.update(ejemplar.id, ejemplar)
        reserva.prestamo_id = prestamo.id
        return self._guardar(reserva)

    def liberar(self, reserva: Reserva, estado: EstadoReserva, hoy: date) -> Reserva:
        estaba_lista = reserva.estado == EstadoReserva.LISTA_PARA_RETIRO
        self.estado_factory.get_state(reserva.estado).transicionar(reserva, estado)
        actualizada = self._guardar(reserva)
        if estaba_lista:
            ejemplar = self._get_ejemplar(reserva)
            ejemplar.estado = EstadoEjemplar.DISPONIBLE
            asignar_reserva(ejemplar, self.reserva_repository, hoy, aviso_repository=self.aviso_repository)
            self.ejemplar_repository.update(ejemplar.id, ejemplar)
        return actualizada

    def _guardar(self, reserva: Reserva) -> Reserva:
        actualizada = self.reserva_repository.update(reserva.id, reserva)
        if actualizada is None:
            raise ErrorHandler(ErrorType.RESERVA_NOT_FOUND)
        return actualizada
