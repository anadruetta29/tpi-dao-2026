from typing import List, Optional
from pydantic import BaseModel
from app.domain.entity.autor import Autor


class AutorRes(BaseModel):
    id: Optional[int] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None

    @staticmethod
    def from_domain(autor: Autor) -> "AutorRes":
        return AutorRes(id=autor.id, nombre=autor.nombre, apellido=autor.apellido)


class GetAllAutoresRes(BaseModel):
    autores: List[AutorRes]

    @staticmethod
    def from_domain_list(autores: List[Autor]) -> "GetAllAutoresRes":
        return GetAllAutoresRes(autores=[AutorRes.from_domain(a) for a in autores])
