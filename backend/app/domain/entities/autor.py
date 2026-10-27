from typing import Optional


class Autor:
    def __init__(
        self,
        nombre: Optional[str] = None,
        apellido: Optional[str] = None,
    ) -> None:
        self.nombre = nombre
        self.apellido = apellido
