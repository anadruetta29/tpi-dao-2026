from typing import Any, Dict, Optional
from app.domain.entity.motivo_multa import MotivoMulta


class CreateMultaReq:
    def __init__(
        self,
        token: Optional[str] = None,
        socio_id: Optional[int] = None,
        prestamo_id: Optional[int] = None,
        motivo: Optional[MotivoMulta] = None,
        monto: Optional[float] = None,
    ) -> None:
        self.token = token
        self.socio_id = socio_id
        self.prestamo_id = prestamo_id
        self.motivo = motivo
        self.monto = monto

    @staticmethod
    def build(token: Optional[str], payload: Dict[str, Any]) -> "CreateMultaReq":
        payload = payload or {}
        raw_motivo = payload.get("motivo")
        motivo = (
            MotivoMulta(raw_motivo)
            if raw_motivo is not None and raw_motivo in [m.value for m in MotivoMulta]
            else None
        )
        return CreateMultaReq(
            token=token,
            socio_id=int(payload["socio_id"]) if payload.get("socio_id") is not None else None,
            prestamo_id=int(payload["prestamo_id"]) if payload.get("prestamo_id") is not None else None,
            motivo=motivo,
            monto=float(payload["monto"]) if payload.get("monto") is not None else None,
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_socio_id(self) -> Optional[int]:
        return self.socio_id

    def get_prestamo_id(self) -> Optional[int]:
        return self.prestamo_id

    def get_motivo(self) -> Optional[MotivoMulta]:
        return self.motivo

    def get_monto(self) -> Optional[float]:
        return self.monto
