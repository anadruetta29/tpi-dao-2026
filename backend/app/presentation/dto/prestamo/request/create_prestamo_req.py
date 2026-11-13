from datetime import date
from typing import Any, Dict, Optional
from app.domain.entity.modalidad_prestamo_local import ModalidadPrestamoLocal


class CreatePrestamoReq:
    def __init__(
        self,
        token: Optional[str] = None,
        solicitud_id: Optional[int] = None,
        modalidad: Optional[ModalidadPrestamoLocal] = None,
        fechaInicio: Optional[date] = None,
        fechaVencimiento: Optional[date] = None,
    ) -> None:
        self.token = token
        self.solicitud_id = solicitud_id
        self.modalidad = modalidad
        self.fechaInicio = fechaInicio
        self.fechaVencimiento = fechaVencimiento

    @staticmethod
    def build(token: Optional[str], payload: Dict[str, Any]) -> "CreatePrestamoReq":
        payload = payload or {}
        raw_mod = payload.get("modalidad")
        modalidad = (
            ModalidadPrestamoLocal(raw_mod)
            if raw_mod is not None and raw_mod in [m.value for m in ModalidadPrestamoLocal]
            else None
        )
        raw_inicio = payload.get("fechaInicio")
        raw_venc = payload.get("fechaVencimiento")
        return CreatePrestamoReq(
            token=token,
            solicitud_id=int(payload["solicitud_id"]) if payload.get("solicitud_id") is not None else None,
            modalidad=modalidad,
            fechaInicio=date.fromisoformat(str(raw_inicio)) if raw_inicio else date.today(),
            fechaVencimiento=date.fromisoformat(str(raw_venc)) if raw_venc else None,
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_solicitud_id(self) -> Optional[int]:
        return self.solicitud_id

    def get_modalidad(self) -> Optional[ModalidadPrestamoLocal]:
        return self.modalidad

    def get_fecha_inicio(self) -> Optional[date]:
        return self.fechaInicio

    def get_fecha_vencimiento(self) -> Optional[date]:
        return self.fechaVencimiento
