from abc import ABC, abstractmethod
from app.presentation.dto.prestamo.request import (
    CreatePrestamoReq,
    GetAllPrestamosReq,
    GetPrestamoByIdReq,
)
from app.presentation.dto.prestamo.response import GetAllPrestamosRes, PrestamoRes


class PrestamoServiceI(ABC):
    @abstractmethod
    def get_all(self, dto: GetAllPrestamosReq) -> GetAllPrestamosRes:
        pass

    @abstractmethod
    def get_by_id(self, dto: GetPrestamoByIdReq) -> PrestamoRes:
        pass

    @abstractmethod
    def create(self, dto: CreatePrestamoReq) -> PrestamoRes:
        pass
