from dataclasses import dataclass
from typing import Optional


@dataclass
class Libro:
    titulo: Optional[str] = None
    añoPublicacion: Optional[int] = None
    editorial: Optional[str] = None
    edicion: Optional[str] = None
