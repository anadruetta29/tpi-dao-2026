from abc import abstractmethod
from typing import List, Optional
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario
from app.domain.repository.base_repository_i import BaseRepositoryI


class UsuarioRepositoryI(BaseRepositoryI[Usuario]):
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[Usuario]:
        pass

    @abstractmethod
    def get_all_filtered(
        self,
        role: Optional[Rol] = None,
        activo: Optional[bool] = None,
    ) -> List[Usuario]:
        pass
