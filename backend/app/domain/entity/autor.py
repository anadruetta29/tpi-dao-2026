from typing import Optional


class Autor:
    def __init__(
        self,
        id: Optional[int] = None,
        nombre: Optional[str] = None,
        apellido: Optional[str] = None,
    ) -> None:
        self.id = id
        self.nombre = nombre
        self.apellido = apellido
