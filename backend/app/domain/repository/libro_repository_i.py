from abc import abstractmethod
from typing import List, Optional
from app.domain.entity.libro import Libro
from app.domain.repository.base_repository_i import BaseRepositoryI


class LibroRepositoryI(BaseRepositoryI[Libro]):
    @abstractmethod
    def get_all_filtered(
        self,
        titulo: Optional[str] = None,
        autor: Optional[str] = None,
        editorial: Optional[str] = None,
    ) -> List[Libro]:
        pass
