from datetime import date
from typing import Optional, Union
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.usuario import Usuario


class HistorialEstadoRemito:
    def __init__(
        self,
        id: Optional[int] = None,
        fechaInicio: Optional[Union[date, str]] = None,
        fechaFin: Optional[Union[date, str]] = None,
        estado: Optional[EstadoEnvio] = None,
        remito_id: Optional[int] = None,
        responsable_id: Optional[int] = None,
        responsable_nombre: Optional[str] = None,
    ) -> None:
        self.id = id
        self.fechaInicio = fechaInicio
        self.fechaFin = fechaFin
        self.estado = estado
        self.remito_id = remito_id
        self.responsable_id = responsable_id
        self.responsable_nombre = responsable_nombre

    @staticmethod
    def registrar(
        estado: EstadoEnvio,
        remito_id: int,
        fecha: date,
        responsable: Usuario,
        cerrado: bool = False,
    ) -> "HistorialEstadoRemito":
        return HistorialEstadoRemito(
            fechaInicio=fecha,
            fechaFin=fecha if cerrado else None,
            estado=estado,
            remito_id=remito_id,
            responsable_id=responsable.id,
            responsable_nombre=" ".join(filter(None, (responsable.nombre, responsable.apellido))) or None,
        )
