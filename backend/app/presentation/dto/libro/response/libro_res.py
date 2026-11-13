from typing import Dict, List, Optional
from pydantic import BaseModel
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.libro import Libro


class LibroRes(BaseModel):
    id: Optional[int] = None
    titulo: Optional[str] = None
    añoPublicacion: Optional[int] = None
    editorial: Optional[str] = None
    edicion: Optional[str] = None
    autor_ids: List[int] = []

    @staticmethod
    def from_domain(libro: Libro) -> "LibroRes":
        return LibroRes(
            id=libro.id,
            titulo=libro.titulo,
            añoPublicacion=libro.añoPublicacion,
            editorial=libro.editorial,
            edicion=libro.edicion,
            autor_ids=libro.autor_ids or [],
        )


class GetAllLibrosRes(BaseModel):
    libros: List[LibroRes]

    @staticmethod
    def from_domain_list(libros: List[Libro]) -> "GetAllLibrosRes":
        return GetAllLibrosRes(libros=[LibroRes.from_domain(l) for l in libros])


class EjemplarDisponibilidadDTO(BaseModel):
    id: Optional[int] = None
    codigo: Optional[str] = None
    estado: Optional[EstadoEjemplar] = None


class SedeDisponibilidadDTO(BaseModel):
    sede_id: Optional[int] = None
    ejemplares: List[EjemplarDisponibilidadDTO]


class GetLibroDisponibilidadRes(BaseModel):
    libro_id: int
    sedes: List[SedeDisponibilidadDTO]

    @staticmethod
    def from_ejemplares(libro_id: int, ejemplares: List[Ejemplar]) -> "GetLibroDisponibilidadRes":
        grouped: Dict[Optional[int], List[EjemplarDisponibilidadDTO]] = {}
        for ej in ejemplares:
            grouped.setdefault(ej.sede_id, []).append(
                EjemplarDisponibilidadDTO(id=ej.id, codigo=ej.codigo, estado=ej.estado)
            )
        return GetLibroDisponibilidadRes(
            libro_id=libro_id,
            sedes=[
                SedeDisponibilidadDTO(sede_id=sede_id, ejemplares=items)
                for sede_id, items in grouped.items()
            ],
        )
