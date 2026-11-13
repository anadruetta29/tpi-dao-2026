from datetime import date
from typing import Any, Dict, Optional


class RecepcionRemitoReq:
    def __init__(
        self,
        token: Optional[str] = None,
        id: Optional[int] = None,
        fechaRecepcion: Optional[date] = None,
        con_incidencia: bool = False,
    ) -> None:
        self.token = token
        self.id = id
        self.fechaRecepcion = fechaRecepcion
        self.con_incidencia = con_incidencia

    @staticmethod
    def build(
        token: Optional[str],
        id: int,
        payload: Optional[Dict[str, Any]] = None,
    ) -> "RecepcionRemitoReq":
        payload = payload or {}
        raw_fecha = payload.get("fechaRecepcion")
        return RecepcionRemitoReq(
            token=token,
            id=id,
            fechaRecepcion=date.fromisoformat(str(raw_fecha)) if raw_fecha else date.today(),
            con_incidencia=bool(payload.get("con_incidencia", False)),
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_id(self) -> Optional[int]:
        return self.id

    def get_fecha_recepcion(self) -> Optional[date]:
        return self.fechaRecepcion

    def get_con_incidencia(self) -> bool:
        return self.con_incidencia
