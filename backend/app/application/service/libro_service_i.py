from abc import ABC, abstractmethod
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


class LibroServiceI(ABC):
    @abstractmethod
    def get_all(self, dto: GetAllLibrosReq) -> GetAllLibrosRes:
        pass

    @abstractmethod
    def get_by_id(self, dto: GetLibroByIdReq) -> LibroRes:
        pass

    @abstractmethod
    def get_disponibilidad(self, dto: GetLibroByIdReq) -> GetLibroDisponibilidadRes:
        pass

    @abstractmethod
    def create(self, dto: CreateLibroReq) -> LibroRes:
        pass

    @abstractmethod
    def update(self, dto: UpdateLibroReq) -> LibroRes:
        pass

    @abstractmethod
    def delete(self, dto: DeleteLibroReq) -> None:
        pass
