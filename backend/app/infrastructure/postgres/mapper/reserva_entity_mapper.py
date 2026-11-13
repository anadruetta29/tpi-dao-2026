from typing import List
from app.domain.entity.reserva import Reserva
from app.infrastructure.postgres.model.reserva_model import ReservaModel


class ReservaEntityMapper:
    @staticmethod
    def to_domain(model: ReservaModel) -> Reserva:
        return Reserva(
            id=model.id,
            fecha=model.fecha,
            estado=model.estado,
            socio_id=model.socio_id,
            libro_id=model.libro_id,
            sede_id=model.sede_id,
            ejemplar_id=model.ejemplar_id,
        )

    @staticmethod
    def to_domain_list(models: List[ReservaModel]) -> List[Reserva]:
        return [ReservaEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: Reserva) -> ReservaModel:
        return ReservaModel(
            id=entity.id,
            fecha=entity.fecha,
            estado=entity.estado,
            socio_id=entity.socio_id,
            libro_id=entity.libro_id,
            sede_id=entity.sede_id,
            ejemplar_id=entity.ejemplar_id,
        )
