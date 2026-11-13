from abc import ABC, abstractmethod
from app.presentation.dto.usuario.request import (
    CreateUsuarioReq,
    GetAllUsuariosReq,
    GetUsuarioByIdReq,
    UpdateUsuarioReq,
)
from app.presentation.dto.usuario.response import GetAllUsuariosRes, UsuarioRes


class UsuarioServiceI(ABC):
    @abstractmethod
    def get_all(self, dto: GetAllUsuariosReq) -> GetAllUsuariosRes:
        pass

    @abstractmethod
    def get_by_id(self, dto: GetUsuarioByIdReq) -> UsuarioRes:
        pass

    @abstractmethod
    def create(self, dto: CreateUsuarioReq) -> UsuarioRes:
        pass

    @abstractmethod
    def update(self, dto: UpdateUsuarioReq) -> UsuarioRes:
        pass
