from datetime import date
from typing import Any, Dict, Optional
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.modalidad_prestamo_local import ModalidadPrestamoLocal
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class UpdateSolicitudEstadoReq:
    def __init__(
        self,
        token: Optional[str] = None,
        id: Optional[int] = None,
        estado: Optional[EstadoSolicitud] = None,
        modalidad: Optional[ModalidadPrestamoLocal] = None,
        fechaVencimiento: Optional[date] = None,
    ) -> None:
        self.token = token
        self.id = id
        self.estado = estado
        self.modalidad = modalidad
        self.fechaVencimiento = fechaVencimiento

    @staticmethod
    def build(token: Optional[str], id: int, payload: Dict[str, Any]) -> "UpdateSolicitudEstadoReq":
        payload = payload or {}
        raw_estado = payload.get("estado")
        estado = (
            EstadoSolicitud(raw_estado)
            if raw_estado is not None and raw_estado in [e.value for e in EstadoSolicitud]
            else None
        )
        raw_modalidad = payload.get("modalidad")
        try:
            modalidad = ModalidadPrestamoLocal(raw_modalidad) if raw_modalidad is not None else None
        except ValueError:
            raise ErrorHandler(ErrorType.BAD_REQUEST, "La modalidad del préstamo es inválida.")
        raw_vencimiento = payload.get("fechaVencimiento")
        try:
            vencimiento = date.fromisoformat(str(raw_vencimiento)) if raw_vencimiento is not None else None
        except ValueError:
            raise ErrorHandler(ErrorType.BAD_REQUEST, "La fecha de vencimiento debe ser válida.")
        return UpdateSolicitudEstadoReq(token, id, estado, modalidad, vencimiento)

    def get_token(self) -> Optional[str]:
        return self.token

    def get_id(self) -> Optional[int]:
        return self.id

    def get_estado(self) -> Optional[EstadoSolicitud]:
        return self.estado

    def get_modalidad(self) -> Optional[ModalidadPrestamoLocal]:
        return self.modalidad

    def get_fecha_vencimiento(self) -> Optional[date]:
        return self.fechaVencimiento
