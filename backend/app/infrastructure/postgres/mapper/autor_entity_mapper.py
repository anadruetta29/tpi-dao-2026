from typing import List
from app.domain.entity.autor import Autor
from app.infrastructure.postgres.model.autor_model import AutorModel


class AutorEntityMapper:
    @staticmethod
    def to_domain(model: AutorModel) -> Autor:
        return Autor(id=model.id, nombre=model.nombre, apellido=model.apellido)

    @staticmethod
    def to_domain_list(models: List[AutorModel]) -> List[Autor]:
        return [AutorEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: Autor) -> AutorModel:
        return AutorModel(id=entity.id, nombre=entity.nombre, apellido=entity.apellido)
