from app.domain.entity.aviso import Aviso
from app.infrastructure.postgres.model.aviso_model import AvisoModel


class AvisoEntityMapper:
    @staticmethod
    def to_domain(model: AvisoModel, leido: bool = False) -> Aviso:
        return Aviso(
            id=model.id, clave=model.clave, tipo=model.tipo, mensaje=model.mensaje,
            fecha=model.fecha, sede_id=model.sede_id, socio_id=model.socio_id,
            reserva_id=model.reserva_id, prestamo_id=model.prestamo_id,
            leido=leido,
        )

    @staticmethod
    def to_model(entity: Aviso) -> AvisoModel:
        return AvisoModel(
            id=entity.id, clave=entity.clave, tipo=entity.tipo, mensaje=entity.mensaje,
            fecha=entity.fecha, sede_id=entity.sede_id, socio_id=entity.socio_id,
            reserva_id=entity.reserva_id, prestamo_id=entity.prestamo_id,
        )
