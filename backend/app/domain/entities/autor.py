from dataclasses import dataclass
from typing import Optional


@dataclass
class Autor:
    nombre: Optional[str] = None
    apellido: Optional[str] = None
