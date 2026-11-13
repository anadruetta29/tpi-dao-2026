from typing import Optional
from uuid import uuid4
from app.application.strategy.solicitud_tipo.core.solicitud_tipo_strategy import (
    SolicitudTipoStrategy,
)
from app.domain.entity.estado_sede import EstadoSede
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.sede_repository_i import SedeRepositoryI


class LocalSolicitudStrategy(SolicitudTipoStrategy):
    def validar_sedes(
        self,
        sede_origen_id: int,
        sede_destino_id: Optional[int],
        sede_repository: SedeRepositoryI,
    ) -> int:
        if sede_destino_id is not None and sede_destino_id != sede_origen_id:
            raise ErrorHandler(
                ErrorType.BAD_REQUEST,
                "En una solicitud local, la sede origen y destino deben coincidir.",
            )
        sede = sede_repository.get_by_id(sede_origen_id)
        if sede is None:
            raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)
        if sede.estado == EstadoSede.BAJA:
            raise ErrorHandler(ErrorType.SEDE_INACTIVE)
        return sede_origen_id

    def construir_solicitud(
        self,
        socio_id: int,
        ejemplar_id: int,
        sede_origen_id: int,
        sede_destino_id: int,
        responsable_origen_id: Optional[int],
    ) -> SolicitudPrestamo:
        return SolicitudPrestamo(
            numero=f"SOL-{uuid4().hex[:8].upper()}",
            tipo=TipoPrestamo.LOCAL,
            estado=EstadoSolicitud.PENDIENTE,
            socio_id=socio_id,
            ejemplar_id=ejemplar_id,
            sede_origen_id=sede_origen_id,
            sede_destino_id=sede_destino_id,
            responsable_origen_id=responsable_origen_id,
        )
