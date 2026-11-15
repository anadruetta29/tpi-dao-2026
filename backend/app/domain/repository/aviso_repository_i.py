from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entity.aviso import Aviso


class AvisoRepositoryI(ABC):
    @abstractmethod
    def crear_si_nuevo(self, aviso: Aviso) -> None:
        pass

    @abstractmethod
    def listar(self, usuario_id: int, sede_id: Optional[int]) -> List[Aviso]:
        pass

    @abstractmethod
    def marcar_leido(self, id: int, usuario_id: int, sede_id: Optional[int]) -> Optional[Aviso]:
        pass
