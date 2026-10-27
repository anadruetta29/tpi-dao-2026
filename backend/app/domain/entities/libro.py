from typing import Optional


class Libro:
    def __init__(
        self,
        titulo: Optional[str] = None,
        añoPublicacion: Optional[int] = None,
        editorial: Optional[str] = None,
        edicion: Optional[str] = None,
    ) -> None:
        self.titulo = titulo
        self.añoPublicacion = añoPublicacion
        self.editorial = editorial
        self.edicion = edicion
