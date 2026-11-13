from abc import ABC, abstractmethod
from app.presentation.dto.ejemplar.request import (
    CreateEjemplarReq,
    GetAllEjemplaresReq,
    GetEjemplarByIdReq,
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
