from typing import List
from app.domain.entity.devolucion import Devolucion
from app.infrastructure.postgres.model.devolucion_model import DevolucionModel


class DevolucionEntityMapper:
    @staticmethod
    def to_domain(model: DevolucionModel) -> Devolucion:
        return Devolucion(
            id=model.id,
            fecha=model.fecha,
            observaciones=model.observaciones,
            estadoDevuelto=model.estadoDevuelto,
            prestamo_id=model.prestamo_id,
        )

    @staticmethod
    def to_domain_list(models: List[DevolucionModel]) -> List[Devolucion]:
        return [DevolucionEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: Devolucion) -> DevolucionModel:
        return DevolucionModel(
            id=entity.id,
            fecha=entity.fecha,
            observaciones=entity.observaciones,
            estadoDevuelto=entity.estadoDevuelto,
            prestamo_id=entity.prestamo_id,
        )
