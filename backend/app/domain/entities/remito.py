from datetime import date
from typing import Optional, Union


class Remito:
    def __init__(
        self,
        numero: Optional[str] = None,
        fechaEmision: Optional[Union[date, str]] = None,
        fechaDespacho: Optional[Union[date, str]] = None,
        fechaRecepcion: Optional[Union[date, str]] = None,
    ) -> None:
        self.numero = numero
        self.fechaEmision = fechaEmision
        self.fechaDespacho = fechaDespacho
        self.fechaRecepcion = fechaRecepcion
