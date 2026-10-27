from typing import Optional
from app.domain.entities.estado_socio import EstadoSocio


class Socio:
    def __init__(
        self,
        nombre: Optional[str] = None,
        apellido: Optional[str] = None,
        documento: Optional[str] = None,
        email: Optional[str] = None,
        telefono: Optional[str] = None,
        estado: Optional[EstadoSocio] = None,
    ) -> None:
        self.nombre = nombre
        self.apellido = apellido
        self.documento = documento
        self.email = email
        self.telefono = telefono
        self.estado = estado
