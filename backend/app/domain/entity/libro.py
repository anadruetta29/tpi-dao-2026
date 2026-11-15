import re
from datetime import date
from typing import List, Optional, Union
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class Libro:
    def __init__(
        self,
        id: Optional[int] = None,
        titulo: Optional[str] = None,
        añoPublicacion: Optional[int] = None,
        editorial: Optional[str] = None,
        edicion: Optional[str] = None,
        autor_ids: Optional[List[int]] = None,
    ) -> None:
        self.id = id
        self.titulo = titulo
        self.añoPublicacion = añoPublicacion
        self.editorial = editorial
        self.edicion = edicion
        self.autor_ids = autor_ids if autor_ids is not None else []

    @staticmethod
    def normalizar_año_publicacion(año: Optional[Union[int, str]]) -> Optional[int]:
        if año is None:
            return None

        valor = str(año)
        if not re.fullmatch(r"[0-9]{1,4}", valor):
            raise ErrorHandler(ErrorType.LIBRO_ANIO_INVALIDO)
        año_publicacion = int(valor)
        if not 1 <= año_publicacion <= date.today().year:
            raise ErrorHandler(ErrorType.LIBRO_ANIO_INVALIDO)
        return año_publicacion
