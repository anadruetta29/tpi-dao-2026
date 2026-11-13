from typing import List, Optional


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
