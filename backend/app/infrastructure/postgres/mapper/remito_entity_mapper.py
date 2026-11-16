from typing import List, Optional
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.remito import Remito
from app.domain.entity.remito_incidencia import RemitoIncidencia
from app.infrastructure.postgres.model.remito_model import RemitoModel


class RemitoEntityMapper:
    @staticmethod
    def to_domain(model: RemitoModel, estado_actual: Optional[EstadoEnvio] = None) -> Remito:
        ejemplar_ids = [e.id for e in (model.ejemplares or []) if e.id is not None]
        incidencias = [
            RemitoIncidencia(
                id=inc.id,
                remito_id=inc.remito_id,
                ejemplar_id=inc.ejemplar_id,
                estado=EstadoEjemplar(inc.estado) if inc.estado is not None else None,
                observacion=inc.observacion or "",
            )
            for inc in (model.incidencias or [])
        ]
        return Remito(
            id=model.id,
            numero=model.numero,
            fechaEmision=model.fechaEmision,
            fechaDespacho=model.fechaDespacho,
            fechaRecepcion=model.fechaRecepcion,
            sede_origen_id=model.sede_origen_id,
            sede_destino_id=model.sede_destino_id,
            ejemplar_ids=ejemplar_ids,
            solicitud_id=model.solicitud_id,
            estado_actual=estado_actual,
            incidencias=incidencias,
        )

    @staticmethod
    def to_domain_list(models: List[RemitoModel]) -> List[Remito]:
        return [RemitoEntityMapper.to_domain(m) for m in models]

    @staticmethod
    def to_model(entity: Remito) -> RemitoModel:
        return RemitoModel(
            id=entity.id,
            numero=entity.numero,
            fechaEmision=entity.fechaEmision,
            fechaDespacho=entity.fechaDespacho,
            fechaRecepcion=entity.fechaRecepcion,
            sede_origen_id=entity.sede_origen_id,
            sede_destino_id=entity.sede_destino_id,
            solicitud_id=entity.solicitud_id,
        )
