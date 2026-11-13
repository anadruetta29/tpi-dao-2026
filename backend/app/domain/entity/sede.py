from typing import Optional
from app.domain.entity.estado_sede import EstadoSede


class Sede:
    def __init__(
        self,
        id: Optional[int] = None,
        nombre: Optional[str] = None,
        telefono: Optional[str] = None,
        email: Optional[str] = None,
        horarioAtencion: Optional[str] = None,
        estado: Optional[EstadoSede] = None,
    ) -> None:
        self.id = id
        self.nombre = nombre
        self.telefono = telefono
        self.email = email
        self.horarioAtencion = horarioAtencion
        self.estado = estado
