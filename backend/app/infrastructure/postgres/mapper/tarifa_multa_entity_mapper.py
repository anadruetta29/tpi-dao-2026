from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.tarifa_multa import TarifaMulta
from app.infrastructure.postgres.model.tarifa_multa_model import TarifaMultaModel


class TarifaMultaEntityMapper:
    @staticmethod
    def to_domain(model: TarifaMultaModel) -> TarifaMulta:
        return TarifaMulta(
            motivo=MotivoMulta(model.motivo),
            monto=float(model.monto),
        )

    @staticmethod
    def to_model(domain: TarifaMulta) -> TarifaMultaModel:
        return TarifaMultaModel(
            motivo=domain.motivo.value,
            monto=float(domain.monto),
        )
