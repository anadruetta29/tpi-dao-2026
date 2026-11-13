from typing import List
from app.domain.entity.socio import Socio
from app.infrastructure.postgres.model.socio_model import SocioModel


class SocioEntityMapper:
    @staticmethod
    def to_domain(model: SocioModel) -> Socio:
        return Socio(
            id=model.id,
            nombre=model.nombre,
            apellido=model.apellido,
            documento=model.documento,
            email=model.email,
            telefono=model.telefono,
            estado=model.estado,
        )

    @staticmethod
    def to_domain_list(models: List[SocioModel]) -> List[Socio]:
        return [SocioEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: Socio) -> SocioModel:
        return SocioModel(
            id=entity.id,
            nombre=entity.nombre,
            apellido=entity.apellido,
            documento=entity.documento,
            email=entity.email,
            telefono=entity.telefono,
            estado=entity.estado,
        )
