from typing import List
from app.domain.entity.remito import Remito
from app.infrastructure.postgres.model.remito_model import RemitoModel


class RemitoEntityMapper:
    @staticmethod
    def to_domain(model: RemitoModel) -> Remito:
        ejemplar_ids = [e.id for e in (model.ejemplares or []) if e.id is not None]
        return Remito(
            id=model.id,
            numero=model.numero,
            fechaEmision=model.fechaEmision,
            fechaDespacho=model.fechaDespacho,
            fechaRecepcion=model.fechaRecepcion,
            sede_origen_id=model.sede_origen_id,
            sede_destino_id=model.sede_destino_id,
            ejemplar_ids=ejemplar_ids,
        )

    @staticmethod
    def to_domain_list(models: List[RemitoModel]) -> List[Remito]:
        return [RemitoEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: Remito) -> RemitoModel:
        return RemitoModel(
            id=entity.id,
            numero=entity.numero,
            fechaEmision=entity.fechaEmision,
            fechaDespacho=entity.fechaDespacho,
            fechaRecepcion=entity.fechaRecepcion,
            sede_origen_id=entity.sede_origen_id,
            sede_destino_id=entity.sede_destino_id,
        )
