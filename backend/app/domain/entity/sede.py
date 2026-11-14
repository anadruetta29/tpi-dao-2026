import re
from typing import Optional
from app.domain.entity.estado_sede import EstadoSede
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


_HORA = r"(?:[01][0-9]|2[0-3]):[0-5][0-9]"
_RANGO_HORARIO = re.compile(rf"({_HORA})[ \t]*-[ \t]*({_HORA})")


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

    @staticmethod
    def normalizar_horario_atencion(horario: str) -> str:
        rango = _RANGO_HORARIO.fullmatch(horario.strip())
        if rango is None:
            raise ErrorHandler(ErrorType.SEDE_HORARIO_INVALIDO)

        apertura, cierre = rango.groups()
        if apertura >= cierre:
            raise ErrorHandler(ErrorType.SEDE_HORARIO_INVALIDO)
        return f"{apertura} - {cierre}"

    def dar_de_baja(self) -> None:
        self.estado = EstadoSede.BAJA

    def actualizar_datos(
        self,
        nombre: Optional[str] = None,
        telefono: Optional[str] = None,
        email: Optional[str] = None,
        horarioAtencion: Optional[str] = None,
    ) -> None:
        if horarioAtencion is not None:
            horarioAtencion = self.normalizar_horario_atencion(horarioAtencion)

        if nombre is not None:
            self.nombre = nombre
        if telefono is not None:
            self.telefono = telefono
        if email is not None:
            self.email = email
        if horarioAtencion is not None:
            self.horarioAtencion = horarioAtencion
