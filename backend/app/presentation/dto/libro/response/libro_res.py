from typing import Dict, List, Optional
from pydantic import BaseModel
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_sede import EstadoSede
from app.domain.entity.libro import Libro
from app.domain.entity.sede import Sede


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
    sede_nombre: Optional[str] = None
    sede_activa: bool
    disponibles: int
    ejemplares: List[EjemplarDisponibilidadDTO]


class GetLibroDisponibilidadRes(BaseModel):
    libro_id: int
    sedes: List[SedeDisponibilidadDTO]

    @staticmethod
    def from_ejemplares(libro_id: int, ejemplares: List[Ejemplar], sedes: List[Sede]) -> "GetLibroDisponibilidadRes":
        sedes_por_id = {sede.id: sede for sede in sedes if sede.id is not None}
        grouped: Dict[Optional[int], List[EjemplarDisponibilidadDTO]] = {
            sede.id: [] for sede in sedes_por_id.values() if sede.estado == EstadoSede.ACTIVA
        }
        for ej in ejemplares:
            grouped.setdefault(ej.sede_id, []).append(
                EjemplarDisponibilidadDTO(id=ej.id, codigo=ej.codigo, estado=ej.estado)
            )
        disponibilidad = []
        for sede_id, items in grouped.items():
            sede = sedes_por_id.get(sede_id)
            activa = sede is not None and sede.estado == EstadoSede.ACTIVA
            disponibilidad.append(SedeDisponibilidadDTO(
                sede_id=sede_id,
                sede_nombre=sede.nombre if sede else None,
                sede_activa=activa,
                disponibles=sum(item.estado == EstadoEjemplar.DISPONIBLE for item in items) if activa else 0,
                ejemplares=items,
            ))
        return GetLibroDisponibilidadRes(
            libro_id=libro_id,
            sedes=disponibilidad,
        )
