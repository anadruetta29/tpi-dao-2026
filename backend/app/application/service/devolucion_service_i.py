from abc import ABC, abstractmethod
from app.presentation.dto.devolucion.request import (
    CreateDevolucionReq,
    GetAllDevolucionesReq,
    GetDevolucionByIdReq,
)
from app.presentation.dto.devolucion.response import DevolucionRes, GetAllDevolucionesRes


class DevolucionServiceI(ABC):
    @abstractmethod
    def get_all(self, dto: GetAllDevolucionesReq) -> GetAllDevolucionesRes:
        pass

    @abstractmethod
    def get_by_id(self, dto: GetDevolucionByIdReq) -> DevolucionRes:
        pass

    @abstractmethod
    def create(self, dto: CreateDevolucionReq) -> DevolucionRes:
        pass
