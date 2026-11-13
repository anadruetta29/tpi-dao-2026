from typing import List
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.infrastructure.postgres.model.solicitud_prestamo_model import SolicitudPrestamoModel


class SolicitudPrestamoEntityMapper:
    @staticmethod
    def to_domain(model: SolicitudPrestamoModel) -> SolicitudPrestamo:
        return SolicitudPrestamo(
            id=model.id,
            numero=model.numero,
            tipo=model.tipo,
            estado=model.estado,
            socio_id=model.socio_id,
            ejemplar_id=model.ejemplar_id,
            sede_origen_id=model.sede_origen_id,
            sede_destino_id=model.sede_destino_id,
            responsable_origen_id=model.responsable_origen_id,
            responsable_destino_id=model.responsable_destino_id,
        )

    @staticmethod
    def to_domain_list(models: List[SolicitudPrestamoModel]) -> List[SolicitudPrestamo]:
        return [SolicitudPrestamoEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: SolicitudPrestamo) -> SolicitudPrestamoModel:
        return SolicitudPrestamoModel(
            id=entity.id,
            numero=entity.numero,
            tipo=entity.tipo,
            estado=entity.estado,
            socio_id=entity.socio_id,
            ejemplar_id=entity.ejemplar_id,
            sede_origen_id=entity.sede_origen_id,
            sede_destino_id=entity.sede_destino_id,
            responsable_origen_id=entity.responsable_origen_id,
            responsable_destino_id=entity.responsable_destino_id,
        )
