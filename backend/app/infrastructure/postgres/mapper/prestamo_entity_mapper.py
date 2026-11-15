from typing import List
from app.domain.entity.prestamo import Prestamo
from app.infrastructure.postgres.model.prestamo_model import PrestamoModel


class PrestamoEntityMapper:
    @staticmethod
    def to_domain(model: PrestamoModel) -> Prestamo:
        return Prestamo(
            id=model.id,
            fechaInicio=model.fechaInicio,
            fechaVencimiento=model.fechaVencimiento,
            fechaDevolucion=model.fechaDevolucion,
            estado=model.estado,
            modalidad=model.modalidad,
            solicitud_id=model.solicitud_id,
            socio_id=model.socio_id,
            sede_id=model.sede_id,
            ejemplar_id=model.ejemplar_id,
            renovaciones=model.renovaciones or 0,
            ejemplar_ids=model.ejemplar_ids,
            ejemplares_devueltos_ids=model.ejemplares_devueltos_ids,
        )

    @staticmethod
    def to_domain_list(models: List[PrestamoModel]) -> List[Prestamo]:
        return [PrestamoEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: Prestamo) -> PrestamoModel:
        return PrestamoModel(
            id=entity.id,
            fechaInicio=entity.fechaInicio,
            fechaVencimiento=entity.fechaVencimiento,
            fechaDevolucion=entity.fechaDevolucion,
            estado=entity.estado,
            modalidad=entity.modalidad,
            solicitud_id=entity.solicitud_id,
            socio_id=entity.socio_id,
            sede_id=entity.sede_id,
            ejemplar_id=entity.ejemplar_id,
            renovaciones=entity.renovaciones,
            ejemplar_ids=entity.ejemplar_ids,
            ejemplares_devueltos_ids=entity.ejemplares_devueltos_ids,
        )
