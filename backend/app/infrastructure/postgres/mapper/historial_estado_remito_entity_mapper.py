from typing import List
from app.domain.entity.historial_estado_remito import HistorialEstadoRemito
from app.infrastructure.postgres.model.historial_estado_remito_model import HistorialEstadoRemitoModel


class HistorialEstadoRemitoEntityMapper:
    @staticmethod
    def to_domain(model: HistorialEstadoRemitoModel) -> HistorialEstadoRemito:
        return HistorialEstadoRemito(
            id=model.id,
            fechaInicio=model.fechaInicio,
            fechaFin=model.fechaFin,
            estado=model.estado,
            remito_id=model.remito_id,
        )

    @staticmethod
    def to_domain_list(models: List[HistorialEstadoRemitoModel]) -> List[HistorialEstadoRemito]:
        return [HistorialEstadoRemitoEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: HistorialEstadoRemito) -> HistorialEstadoRemitoModel:
        return HistorialEstadoRemitoModel(
            id=entity.id,
            fechaInicio=entity.fechaInicio,
            fechaFin=entity.fechaFin,
            estado=entity.estado,
            remito_id=entity.remito_id,
        )
