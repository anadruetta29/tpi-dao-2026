from datetime import date
from typing import List, Optional, Union
from app.domain.entity.estado_envio import EstadoEnvio


class Remito:
    def __init__(
        self,
        id: Optional[int] = None,
        numero: Optional[str] = None,
        fechaEmision: Optional[Union[date, str]] = None,
        fechaDespacho: Optional[Union[date, str]] = None,
        fechaRecepcion: Optional[Union[date, str]] = None,
        sede_origen_id: Optional[int] = None,
        sede_destino_id: Optional[int] = None,
        ejemplar_ids: Optional[List[int]] = None,
        solicitud_id: Optional[int] = None,
        estado_actual: Optional[EstadoEnvio] = None,
    ) -> None:
        self.id = id
        self.numero = numero
        self.fechaEmision = fechaEmision
        self.fechaDespacho = fechaDespacho
        self.fechaRecepcion = fechaRecepcion
        self.sede_origen_id = sede_origen_id
        self.sede_destino_id = sede_destino_id
        self.ejemplar_ids = ejemplar_ids if ejemplar_ids is not None else []
        self.solicitud_id = solicitud_id
        self.estado_actual = estado_actual

    def dias_transito(self, hoy: Optional[date] = None) -> Optional[int]:
        if self.fechaDespacho is None:
            return None
        fecha_despacho = (
            date.fromisoformat(self.fechaDespacho) if isinstance(self.fechaDespacho, str) else self.fechaDespacho
        )
        fecha_recepcion = (
            date.fromisoformat(self.fechaRecepcion) if isinstance(self.fechaRecepcion, str) else self.fechaRecepcion
        )
        return max(0, ((fecha_recepcion or hoy or date.today()) - fecha_despacho).days)

    def registrar_despacho(self, fecha_despacho: Optional[date] = None) -> None:
        self.fechaDespacho = fecha_despacho or date.today()

    def registrar_recepcion(self, fecha_recepcion: Optional[date] = None) -> None:
        self.fechaRecepcion = fecha_recepcion or date.today()
