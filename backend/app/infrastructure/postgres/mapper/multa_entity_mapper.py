from typing import List
from app.domain.entity.multa import Multa
from app.infrastructure.postgres.model.multa_model import MultaModel


class MultaEntityMapper:
    @staticmethod
    def to_domain(model: MultaModel) -> Multa:
        return Multa(
            id=model.id,
            fechaEmision=model.fechaEmision,
            motivo=model.motivo,
            monto=model.monto,
            estado=model.estado,
            fechaPago=model.fechaPago,
            socio_id=model.socio_id,
            prestamo_id=model.prestamo_id,
        )

    @staticmethod
    def to_domain_list(models: List[MultaModel]) -> List[Multa]:
        return [MultaEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: Multa) -> MultaModel:
        return MultaModel(
            id=entity.id,
            fechaEmision=entity.fechaEmision,
            motivo=entity.motivo,
            monto=entity.monto,
            estado=entity.estado,
            fechaPago=entity.fechaPago,
            socio_id=entity.socio_id,
            prestamo_id=entity.prestamo_id,
        )
