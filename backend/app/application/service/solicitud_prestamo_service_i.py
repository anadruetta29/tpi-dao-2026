from abc import ABC, abstractmethod
from app.presentation.dto.solicitud_prestamo.request import (
    CreateSolicitudInterbibliotecariaReq,
    CreateSolicitudLocalReq,
    GetAllSolicitudesPrestamoReq,
    GetSolicitudPrestamoByIdReq,
    UpdateSolicitudEstadoReq,
)
from app.presentation.dto.solicitud_prestamo.response import (
    GetAllSolicitudesPrestamoRes,
    SolicitudPrestamoRes,
)


class SolicitudPrestamoServiceI(ABC):
    @abstractmethod
    def get_all(self, dto: GetAllSolicitudesPrestamoReq) -> GetAllSolicitudesPrestamoRes:
        pass

    @abstractmethod
    def get_by_id(self, dto: GetSolicitudPrestamoByIdReq) -> SolicitudPrestamoRes:
        pass

    @abstractmethod
    def create_local(self, dto: CreateSolicitudLocalReq) -> SolicitudPrestamoRes:
        pass

    @abstractmethod
    def create_interbibliotecaria(
        self, dto: CreateSolicitudInterbibliotecariaReq
    ) -> SolicitudPrestamoRes:
        pass

    @abstractmethod
    def update_estado(self, dto: UpdateSolicitudEstadoReq) -> SolicitudPrestamoRes:
        pass
