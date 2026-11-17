from abc import ABC, abstractmethod
from app.presentation.dto.autor.request import (
    CreateAutorReq,
    GetAllAutoresReq,
    UpdateAutorReq,
)
from app.presentation.dto.autor.response import AutorRes, GetAllAutoresRes


class AutorServiceI(ABC):
    @abstractmethod
    def get_all(self, dto: GetAllAutoresReq) -> GetAllAutoresRes:
        pass

    @abstractmethod
    def create(self, dto: CreateAutorReq) -> AutorRes:
        pass

    @abstractmethod
    def update(self, dto: UpdateAutorReq) -> AutorRes:
        pass
