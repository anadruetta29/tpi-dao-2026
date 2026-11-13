from abc import ABC, abstractmethod
from app.presentation.dto.sede.request import (
    CreateSedeReq,
    DeleteSedeReq,
    GetAllSedesReq,
    GetSedeByIdReq,
    UpdateSedeReq,
)
from app.presentation.dto.sede.response import GetAllSedesRes, SedeRes


class SedeServiceI(ABC):
    @abstractmethod
    def get_all(self, dto: GetAllSedesReq) -> GetAllSedesRes:
        pass

    @abstractmethod
    def get_by_id(self, dto: GetSedeByIdReq) -> SedeRes:
        pass

    @abstractmethod
    def create(self, dto: CreateSedeReq) -> SedeRes:
        pass

    @abstractmethod
    def update(self, dto: UpdateSedeReq) -> SedeRes:
        pass

    @abstractmethod
    def delete(self, dto: DeleteSedeReq) -> SedeRes:
        pass
