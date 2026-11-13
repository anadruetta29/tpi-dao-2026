from abc import abstractmethod
from typing import List, Optional
from app.domain.entity.estado_socio import EstadoSocio
from app.domain.entity.socio import Socio
from app.domain.repository.base_repository_i import BaseRepositoryI


class SocioRepositoryI(BaseRepositoryI[Socio]):
    @abstractmethod
    def get_all_filtered(
        self,
        q: Optional[str] = None,
        documento: Optional[str] = None,
        estado: Optional[EstadoSocio] = None,
    ) -> List[Socio]:
        pass

    @abstractmethod
    def get_by_documento(self, documento: str) -> Optional[Socio]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[Socio]:
        pass
