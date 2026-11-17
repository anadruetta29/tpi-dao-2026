from abc import ABC, abstractmethod
from typing import Optional
from app.presentation.dto.aviso.response.aviso_res import AvisoRes, GetAllAvisosRes


class AvisoServiceI(ABC):
    @abstractmethod
    def listar(self, token: Optional[str]) -> GetAllAvisosRes:
        pass

    @abstractmethod
    def marcar_leido(self, token: Optional[str], id: int) -> AvisoRes:
        pass
