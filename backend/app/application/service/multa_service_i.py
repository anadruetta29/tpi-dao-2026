from abc import ABC, abstractmethod
from app.presentation.dto.multa.request import (
    CreateMultaReq,
    GetAllMultasReq,
    GetMultaByIdReq,
    MultaActionReq,
)
from app.presentation.dto.multa.response import GetAllMultasRes, MultaRes


class MultaServiceI(ABC):
    @abstractmethod
    def get_all(self, dto: GetAllMultasReq) -> GetAllMultasRes:
        pass

    @abstractmethod
    def get_by_id(self, dto: GetMultaByIdReq) -> MultaRes:
        pass

    @abstractmethod
    def create(self, dto: CreateMultaReq) -> MultaRes:
        pass

    @abstractmethod
    def pagar(self, dto: MultaActionReq) -> MultaRes:
        pass

    @abstractmethod
    def anular(self, dto: MultaActionReq) -> MultaRes:
        pass
