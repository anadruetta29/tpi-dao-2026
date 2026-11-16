from typing import Any, Dict, Optional
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class UpdateTarifaMultaReq:
    def __init__(
        self,
        token: Optional[str] = None,
        motivo: Optional[MotivoMulta] = None,
        monto: Optional[float] = None,
    ) -> None:
        self.token = token
        self.motivo = motivo
        self.monto = monto

    @staticmethod
    def build(token: Optional[str], raw_motivo: str, payload: Dict[str, Any]) -> "UpdateTarifaMultaReq":
        payload = payload or {}
        try:
            motivo = MotivoMulta(raw_motivo)
        except ValueError:
            raise ErrorHandler(ErrorType.BAD_REQUEST, "Motivo de multa inválido.")
        raw_monto = payload.get("monto")
        try:
            monto = float(raw_monto) if raw_monto is not None else None
        except (TypeError, ValueError):
            raise ErrorHandler(ErrorType.BAD_REQUEST, "El monto debe ser numérico.")
        return UpdateTarifaMultaReq(token=token, motivo=motivo, monto=monto)

    def get_token(self) -> Optional[str]:
        return self.token

    def get_motivo(self) -> Optional[MotivoMulta]:
        return self.motivo

    def get_monto(self) -> Optional[float]:
        return self.monto
