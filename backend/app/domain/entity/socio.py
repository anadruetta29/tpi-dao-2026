import re
from typing import Optional
from unicodedata import normalize
from app.domain.entity.estado_socio import EstadoSocio
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class Socio:
    def __init__(
        self,
        id: Optional[int] = None,
        nombre: Optional[str] = None,
        apellido: Optional[str] = None,
        documento: Optional[str] = None,
        email: Optional[str] = None,
        telefono: Optional[str] = None,
        estado: Optional[EstadoSocio] = None,
    ) -> None:
        self.id = id
        self.nombre = nombre
        self.apellido = apellido
        self.documento = documento
        self.email = email
        self.telefono = telefono
        self.estado = estado

    def validar_habilitado(self) -> None:
        if self.estado == EstadoSocio.INHABILITADO:
            raise ErrorHandler(ErrorType.SOCIO_INHABILITADO)

    def habilitar(self) -> None:
        self.estado = EstadoSocio.HABILITADO

    def inhabilitar(self) -> None:
        self.estado = EstadoSocio.INHABILITADO

    def actualizar_datos(
        self,
        nombre: Optional[str] = None,
        apellido: Optional[str] = None,
        documento: Optional[str] = None,
        email: Optional[str] = None,
        telefono: Optional[str] = None,
    ) -> None:
        nombre = self._normalizar_nombre(nombre)
        apellido = self._normalizar_nombre(apellido)
        if documento is not None and (
            not re.fullmatch(r"[0-9]{7,8}", documento) or int(documento) == 0
        ):
            raise ErrorHandler(ErrorType.SOCIO_DOCUMENTO_INVALIDO)
        if telefono is not None and not re.fullmatch(r"[0-9]{1,10}", telefono):
            raise ErrorHandler(ErrorType.SOCIO_TELEFONO_INVALIDO)

        if nombre is not None:
            self.nombre = nombre
        if apellido is not None:
            self.apellido = apellido
        if documento is not None:
            self.documento = documento
        if email is not None:
            self.email = email
        if telefono is not None:
            self.telefono = telefono

    @staticmethod
    def _normalizar_nombre(nombre: Optional[str]) -> Optional[str]:
        if nombre is None:
            return None
        valor = normalize("NFC", nombre.strip())
        if not 2 <= len(valor) <= 100 or not valor.replace(" ", "").isalpha():
            raise ErrorHandler(ErrorType.SOCIO_NOMBRE_INVALIDO)
        return valor
