from abc import ABC, abstractmethod
from app.presentation.dto.reserva.request import (
    CreateReservaReq,
    GetAllReservasReq,
    GetReservaByIdReq,
    UpdateReservaEstadoReq,
)
from app.presentation.dto.reserva.response import GetAllReservasRes, ReservaRes


class ReservaServiceI(ABC):
    @abstractmethod
    def get_all(self, dto: GetAllReservasReq) -> GetAllReservasRes:
        pass

    @abstractmethod
    def get_by_id(self, dto: GetReservaByIdReq) -> ReservaRes:
        pass

    @abstractmethod
    def create(self, dto: CreateReservaReq) -> ReservaRes:
        pass

    @abstractmethod
    def update_estado(self, dto: UpdateReservaEstadoReq) -> ReservaRes:
        pass
