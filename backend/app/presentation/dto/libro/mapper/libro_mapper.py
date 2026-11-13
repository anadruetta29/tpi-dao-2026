from typing import Any, Dict, List, Optional
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.libro import Libro
from app.presentation.dto.libro.request import (
    CreateLibroReq,
    DeleteLibroReq,
    GetAllLibrosReq,
    GetLibroByIdReq,
    UpdateLibroReq,
)
from app.presentation.dto.libro.response import (
    GetAllLibrosRes,
    GetLibroDisponibilidadRes,
    LibroRes,
)


class LibroMapper:
    @staticmethod
    def to_get_all_request(
        token: Optional[str],
        titulo: Optional[str] = None,
        autor: Optional[str] = None,
        editorial: Optional[str] = None,
    ) -> GetAllLibrosReq:
        return GetAllLibrosReq.build(token, titulo, autor, editorial)

    @staticmethod
    def to_get_all_response(libros: List[Libro]) -> GetAllLibrosRes:
        return GetAllLibrosRes.from_domain_list(libros)

    @staticmethod
    def to_get_by_id_request(token: Optional[str], id: int) -> GetLibroByIdReq:
        return GetLibroByIdReq.build(token, id)

    @staticmethod
    def to_create_request(token: Optional[str], payload: Dict[str, Any]) -> CreateLibroReq:
        return CreateLibroReq.build(token, payload)

    @staticmethod
    def to_update_request(token: Optional[str], id: int, payload: Dict[str, Any]) -> UpdateLibroReq:
        return UpdateLibroReq.build(token, id, payload)

    @staticmethod
    def to_delete_request(token: Optional[str], id: int) -> DeleteLibroReq:
        return DeleteLibroReq.build(token, id)

    @staticmethod
    def to_response(libro: Libro) -> LibroRes:
        return LibroRes.from_domain(libro)

    @staticmethod
    def to_disponibilidad_response(libro_id: int, ejemplares: List[Ejemplar]) -> GetLibroDisponibilidadRes:
        return GetLibroDisponibilidadRes.from_ejemplares(libro_id, ejemplares)
