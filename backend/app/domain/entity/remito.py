from datetime import date
from typing import List, Optional, Union


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
    ) -> None:
        self.id = id
        self.numero = numero
        self.fechaEmision = fechaEmision
        self.fechaDespacho = fechaDespacho
        self.fechaRecepcion = fechaRecepcion
        self.sede_origen_id = sede_origen_id
        self.sede_destino_id = sede_destino_id
        self.ejemplar_ids = ejemplar_ids if ejemplar_ids is not None else []

    def registrar_despacho(self, fecha_despacho: Optional[date] = None) -> None:
        self.fechaDespacho = fecha_despacho or date.today()

    def registrar_recepcion(self, fecha_recepcion: Optional[date] = None) -> None:
        self.fechaRecepcion = fecha_recepcion or date.today()
