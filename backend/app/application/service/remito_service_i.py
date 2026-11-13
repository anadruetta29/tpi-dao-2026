from abc import ABC, abstractmethod
from app.presentation.dto.remito.request import (
    CreateRemitoReq,
    DespachoRemitoReq,
    GetAllRemitosReq,
    GetRemitoByIdReq,
    RecepcionRemitoReq,
)
from app.presentation.dto.remito.response import (
    GetAllRemitosRes,
    GetRemitoTrazabilidadRes,
    RemitoRes,
)


class RemitoServiceI(ABC):
    @abstractmethod
    def get_all(self, dto: GetAllRemitosReq) -> GetAllRemitosRes:
        pass

    @abstractmethod
    def get_by_id(self, dto: GetRemitoByIdReq) -> RemitoRes:
        pass

    @abstractmethod
    def create(self, dto: CreateRemitoReq) -> RemitoRes:
        pass

    @abstractmethod
    def despachar(self, dto: DespachoRemitoReq) -> RemitoRes:
        pass

    @abstractmethod
    def recibir(self, dto: RecepcionRemitoReq) -> RemitoRes:
        pass

    @abstractmethod
    def get_trazabilidad(self, dto: GetRemitoByIdReq) -> GetRemitoTrazabilidadRes:
        pass
