from typing import List, Optional
from pydantic import BaseModel
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar


class EjemplarRes(BaseModel):
    id: Optional[int] = None
    codigo: Optional[str] = None
    estado: Optional[EstadoEjemplar] = None
    libro_id: Optional[int] = None
    sede_id: Optional[int] = None

    @staticmethod
    def from_domain(ejemplar: Ejemplar) -> "EjemplarRes":
        return EjemplarRes(
            id=ejemplar.id,
            codigo=ejemplar.codigo,
            estado=ejemplar.estado,
            libro_id=ejemplar.libro_id,
            sede_id=ejemplar.sede_id,
        )


class GetAllEjemplaresRes(BaseModel):
    ejemplares: List[EjemplarRes]

    @staticmethod
    def from_domain_list(ejemplares: List[Ejemplar]) -> "GetAllEjemplaresRes":
        return GetAllEjemplaresRes(ejemplares=[EjemplarRes.from_domain(e) for e in ejemplares])
