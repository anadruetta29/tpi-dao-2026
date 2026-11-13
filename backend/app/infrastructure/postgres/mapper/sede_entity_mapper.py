from typing import List
from app.domain.entity.sede import Sede
from app.infrastructure.postgres.model.sede_model import SedeModel


class SedeEntityMapper:
    @staticmethod
    def to_domain(model: SedeModel) -> Sede:
        return Sede(
            id=model.id,
            nombre=model.nombre,
            telefono=model.telefono,
            email=model.email,
            horarioAtencion=model.horarioAtencion,
            estado=model.estado,
        )

    @staticmethod
    def to_domain_list(models: List[SedeModel]) -> List[Sede]:
        return [SedeEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: Sede) -> SedeModel:
        return SedeModel(
            id=entity.id,
            nombre=entity.nombre,
            telefono=entity.telefono,
            email=entity.email,
            horarioAtencion=entity.horarioAtencion,
            estado=entity.estado,
        )
