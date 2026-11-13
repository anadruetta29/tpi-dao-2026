from abc import ABC, abstractmethod
from app.presentation.dto.socio.request import (
    CreateSocioReq,
    DeleteSocioReq,
    GetAllSociosReq,
    GetSocioByIdReq,
    UpdateSocioReq,
)
from app.presentation.dto.socio.response import (
    GetAllSociosRes,
    GetSocioMultasRes,
    GetSocioPrestamosRes,
    SocioRes,
)


class SocioServiceI(ABC):
    @abstractmethod
    def get_all(self, dto: GetAllSociosReq) -> GetAllSociosRes:
        pass

    @abstractmethod
    def get_by_id(self, dto: GetSocioByIdReq) -> SocioRes:
        pass

    @abstractmethod
    def get_prestamos(self, dto: GetSocioByIdReq) -> GetSocioPrestamosRes:
        pass

    @abstractmethod
    def get_multas(self, dto: GetSocioByIdReq) -> GetSocioMultasRes:
        pass

    @abstractmethod
    def create(self, dto: CreateSocioReq) -> SocioRes:
        pass

    @abstractmethod
    def update(self, dto: UpdateSocioReq) -> SocioRes:
        pass

    @abstractmethod
    def delete(self, dto: DeleteSocioReq) -> SocioRes:
        pass
