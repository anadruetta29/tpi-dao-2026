from typing import List
from app.domain.entity.ejemplar import Ejemplar
from app.infrastructure.postgres.model.ejemplar_model import EjemplarModel


class EjemplarEntityMapper:
    @staticmethod
    def to_domain(model: EjemplarModel) -> Ejemplar:
        return Ejemplar(
            id=model.id,
            codigo=model.codigo,
            estado=model.estado,
            libro_id=model.libro_id,
            sede_id=model.sede_id,
        )

    @staticmethod
    def to_domain_list(models: List[EjemplarModel]) -> List[Ejemplar]:
        return [EjemplarEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: Ejemplar) -> EjemplarModel:
        return EjemplarModel(
            id=entity.id,
            codigo=entity.codigo,
            estado=entity.estado,
            libro_id=entity.libro_id,
            sede_id=entity.sede_id,
        )
