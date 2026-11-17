from abc import ABC, abstractmethod
from app.presentation.dto.ejemplar.request import (
    CreateEjemplarReq,
    DeleteEjemplarReq,
    GetAllEjemplaresReq,
    GetEjemplarByIdReq,
    UpdateEjemplarEstadoReq,
)
from app.presentation.dto.ejemplar.response import EjemplarRes, GetAllEjemplaresRes


class EjemplarServiceI(ABC):
    @abstractmethod
    def get_all(self, dto: GetAllEjemplaresReq) -> GetAllEjemplaresRes:
        pass

    @abstractmethod
    def get_by_id(self, dto: GetEjemplarByIdReq) -> EjemplarRes:
        pass

    @abstractmethod
    def create(self, dto: CreateEjemplarReq) -> EjemplarRes:
        pass

    @abstractmethod
    def update_estado(self, dto: UpdateEjemplarEstadoReq) -> EjemplarRes:
        pass

    @abstractmethod
    def delete(self, dto: DeleteEjemplarReq) -> None:
        pass
