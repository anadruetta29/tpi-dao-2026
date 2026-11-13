from typing import Optional
from app.domain.entity.estado_sede import EstadoSede
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


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

    def validar_activa(self) -> None:
        if self.estado == EstadoSede.BAJA:
            raise ErrorHandler(ErrorType.SEDE_INACTIVE)

    def dar_de_baja(self) -> None:
        self.estado = EstadoSede.BAJA

    def actualizar_datos(
        self,
        nombre: Optional[str] = None,
        telefono: Optional[str] = None,
        email: Optional[str] = None,
        horarioAtencion: Optional[str] = None,
    ) -> None:
        if nombre is not None:
            self.nombre = nombre
        if telefono is not None:
            self.telefono = telefono
        if email is not None:
            self.email = email
        if horarioAtencion is not None:
            self.horarioAtencion = horarioAtencion
