from typing import Optional
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class SolicitudPrestamo:
    def __init__(
        self,
        id: Optional[int] = None,
        numero: Optional[str] = None,
        tipo: Optional[TipoPrestamo] = None,
        estado: Optional[EstadoSolicitud] = None,
        socio_id: Optional[int] = None,
        ejemplar_id: Optional[int] = None,
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
        responsable_origen_id: Optional[int] = None,
        responsable_destino_id: Optional[int] = None,
    ) -> None:
        self.id = id
        self.numero = numero
        self.tipo = tipo
        self.estado = estado
        self.socio_id = socio_id
        self.ejemplar_id = ejemplar_id
        self.sede_origen_id = sede_origen_id
        self.sede_destino_id = sede_destino_id
        self.responsable_origen_id = responsable_origen_id
        self.responsable_destino_id = responsable_destino_id

    def validar_aprobada(self) -> None:
        if self.estado != EstadoSolicitud.APROBADA:
            raise ErrorHandler(ErrorType.SOLICITUD_NOT_APPROVED)

    def sede_efectiva(self) -> Optional[int]:
        return self.sede_destino_id or self.sede_origen_id
