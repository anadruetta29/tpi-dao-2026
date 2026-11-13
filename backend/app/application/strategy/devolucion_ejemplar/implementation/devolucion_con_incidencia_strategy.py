from datetime import date
from typing import Dict, Optional
from app.application.strategy.devolucion_ejemplar.core.devolucion_ejemplar_strategy import (
    DevolucionEjemplarStrategy,
)
from app.application.strategy.ejemplar_estado.core.ejemplar_estado_state_factory import (
    EjemplarEstadoStateFactory,
)
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.prestamo import Prestamo
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.multa_repository_i import MultaRepositoryI
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI


_MOTIVO_POR_ESTADO: Dict[EstadoEjemplar, MotivoMulta] = {
    EstadoEjemplar.EXTRAVIADO: MotivoMulta.EXTRAVIO,
    EstadoEjemplar.DESTRUIDO: MotivoMulta.DESTRUCCION,
}


class DevolucionConIncidenciaStrategy(DevolucionEjemplarStrategy):
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

        if ejemplar is not None and ejemplar.id is not None:
            EjemplarEstadoStateFactory().get_state(ejemplar.estado).devolver(
                ejemplar, estado_devuelto
            )
            ejemplar_repository.update(ejemplar.id, ejemplar)

        motivo = _MOTIVO_POR_ESTADO.get(estado_devuelto)
        if motivo is not None:
            self._generar_multa(
                socio_id=prestamo.socio_id,
                prestamo_id=prestamo.id,
                motivo=motivo,
                fecha_emision=fecha_devolucion,
                dias_atraso=1,
                multa_repository=multa_repository,
                socio_repository=socio_repository,
            )
