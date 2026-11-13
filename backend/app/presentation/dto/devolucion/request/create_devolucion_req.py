from datetime import date
from typing import Any, Dict, Optional
from app.domain.entity.estado_ejemplar import EstadoEjemplar


class CreateDevolucionReq:
    def __init__(
        self,
        token: Optional[str] = None,
        prestamo_id: Optional[int] = None,
        fecha: Optional[date] = None,
        observaciones: Optional[str] = None,
        estadoDevuelto: Optional[EstadoEjemplar] = None,
    ) -> None:
        self.token = token
        self.prestamo_id = prestamo_id
        self.fecha = fecha
        self.observaciones = observaciones
        self.estadoDevuelto = estadoDevuelto

    @staticmethod
    def build(token: Optional[str], payload: Dict[str, Any]) -> "CreateDevolucionReq":
        payload = payload or {}
        raw_fecha = payload.get("fecha")
        raw_estado = payload.get("estadoDevuelto")
        estado = (
            EstadoEjemplar(raw_estado)
            if raw_estado is not None and raw_estado in [e.value for e in EstadoEjemplar]
            else None
        )
        return CreateDevolucionReq(
            token=token,
            prestamo_id=int(payload["prestamo_id"]) if payload.get("prestamo_id") is not None else None,
            fecha=date.fromisoformat(str(raw_fecha)) if raw_fecha else date.today(),
            observaciones=(
                str(payload["observaciones"]).strip()
                if payload.get("observaciones") is not None
                else None
            ),
            estadoDevuelto=estado,
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_prestamo_id(self) -> Optional[int]:
        return self.prestamo_id

    def get_fecha(self) -> Optional[date]:
        return self.fecha

    def get_observaciones(self) -> Optional[str]:
        return self.observaciones

    def get_estado_devuelto(self) -> Optional[EstadoEjemplar]:
        return self.estadoDevuelto
