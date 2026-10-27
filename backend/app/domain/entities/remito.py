from dataclasses import dataclass
from datetime import date
from typing import Optional, Union


@dataclass
class Remito:
    numero: Optional[str] = None
    fechaEmision: Optional[Union[date, str]] = None
    fechaDespacho: Optional[Union[date, str]] = None
    fechaRecepcion: Optional[Union[date, str]] = None
