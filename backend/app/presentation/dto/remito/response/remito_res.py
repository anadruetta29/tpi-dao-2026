from datetime import date
from typing import List, Optional, Union
from pydantic import BaseModel
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.historial_estado_remito import HistorialEstadoRemito
from app.domain.entity.remito import Remito


class RemitoRes(BaseModel):
    id: Optional[int] = None
    numero: Optional[str] = None
    fechaEmision: Optional[Union[date, str]] = None
    fechaDespacho: Optional[Union[date, str]] = None
    fechaRecepcion: Optional[Union[date, str]] = None
    sede_origen_id: Optional[int] = None
    sede_destino_id: Optional[int] = None
    ejemplar_ids: List[int] = []

    @staticmethod
    def from_domain(remito: Remito) -> "RemitoRes":
        return RemitoRes(
            id=remito.id,
            numero=remito.numero,
            fechaEmision=remito.fechaEmision,
            fechaDespacho=remito.fechaDespacho,
            fechaRecepcion=remito.fechaRecepcion,
            sede_origen_id=remito.sede_origen_id,
            sede_destino_id=remito.sede_destino_id,
            ejemplar_ids=remito.ejemplar_ids or [],
        )


class GetAllRemitosRes(BaseModel):
    remitos: List[RemitoRes]

    @staticmethod
    def from_domain_list(remitos: List[Remito]) -> "GetAllRemitosRes":
        return GetAllRemitosRes(remitos=[RemitoRes.from_domain(r) for r in remitos])


class HistorialEstadoRemitoRes(BaseModel):
    id: Optional[int] = None
    fechaInicio: Optional[Union[date, str]] = None
    fechaFin: Optional[Union[date, str]] = None
    estado: Optional[EstadoEnvio] = None
    remito_id: Optional[int] = None

    @staticmethod
    def from_domain(item: HistorialEstadoRemito) -> "HistorialEstadoRemitoRes":
        return HistorialEstadoRemitoRes(
            id=item.id,
            fechaInicio=item.fechaInicio,
            fechaFin=item.fechaFin,
            estado=item.estado,
            remito_id=item.remito_id,
        )


class GetRemitoTrazabilidadRes(BaseModel):
    remito_id: int
    historial: List[HistorialEstadoRemitoRes]

    @staticmethod
    def from_domain_list(
        remito_id: int, historial: List[HistorialEstadoRemito]
    ) -> "GetRemitoTrazabilidadRes":
        return GetRemitoTrazabilidadRes(
            remito_id=remito_id,
            historial=[HistorialEstadoRemitoRes.from_domain(h) for h in historial],
        )
