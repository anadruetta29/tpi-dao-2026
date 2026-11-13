from typing import Optional
from uuid import uuid4
from app.application.strategy.solicitud_tipo.core.solicitud_tipo_strategy import (
    SolicitudTipoStrategy,
)
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType
from app.domain.repository.sede_repository_i import SedeRepositoryI


class InterbibliotecariaSolicitudStrategy(SolicitudTipoStrategy):
    def validar_sedes(
        self,
        sede_origen_id: int,
        sede_destino_id: Optional[int],
        sede_repository: SedeRepositoryI,
    ) -> int:
        if sede_destino_id is None:
            raise ErrorHandler(ErrorType.MISSING_REQUIRED_FIELDS)
        if sede_destino_id == sede_origen_id:
            raise ErrorHandler(
                ErrorType.BAD_REQUEST,
                "En una solicitud interbibliotecaria, la sede origen y destino deben ser distintas.",
            )

        for sede_id in (sede_origen_id, sede_destino_id):
            sede = sede_repository.get_by_id(sede_id)
            if sede is None:
                raise ErrorHandler(ErrorType.SEDE_NOT_FOUND)
            sede.validar_activa()

        return sede_destino_id

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
            tipo=TipoPrestamo.INTERBIBLIOTECARIO,
            estado=EstadoSolicitud.PENDIENTE,
            socio_id=socio_id,
            ejemplar_id=ejemplar_id,
            sede_origen_id=sede_origen_id,
            sede_destino_id=sede_destino_id,
            responsable_origen_id=responsable_origen_id,
        )
