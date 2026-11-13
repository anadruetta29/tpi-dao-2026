from datetime import date
from typing import Optional, Union
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.modalidad_prestamo_local import ModalidadPrestamoLocal
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class Prestamo:
    def __init__(
        self,
        id: Optional[int] = None,
        fechaInicio: Optional[Union[date, str]] = None,
        fechaVencimiento: Optional[Union[date, str]] = None,
        fechaDevolucion: Optional[Union[date, str]] = None,
        estado: Optional[EstadoPrestamo] = None,
        modalidad: Optional[ModalidadPrestamoLocal] = None,
        solicitud_id: Optional[int] = None,
        socio_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        ejemplar_id: Optional[int] = None,
    ) -> None:
        self.id = id
        self.fechaInicio = fechaInicio
        self.fechaVencimiento = fechaVencimiento
        self.fechaDevolucion = fechaDevolucion
        self.estado = estado
        self.modalidad = modalidad
        self.solicitud_id = solicitud_id
        self.socio_id = socio_id
        self.sede_id = sede_id
        self.ejemplar_id = ejemplar_id

    def validar_no_devuelto(self) -> None:
        if self.estado == EstadoPrestamo.DEVUELTO:
            raise ErrorHandler(ErrorType.PRESTAMO_ALREADY_RETURNED)

    def _fecha_vencimiento_as_date(self) -> Optional[date]:
        if self.fechaVencimiento is None:
            return None
        if isinstance(self.fechaVencimiento, date):
            return self.fechaVencimiento
        return date.fromisoformat(self.fechaVencimiento)

    def esta_vencido(self, fecha_referencia: Optional[date] = None) -> bool:
        vencimiento = self._fecha_vencimiento_as_date()
        if vencimiento is None:
            return False
        return (fecha_referencia or date.today()) > vencimiento

    def dias_de_atraso(self, fecha_referencia: Optional[date] = None) -> int:
        vencimiento = self._fecha_vencimiento_as_date()
        if vencimiento is None:
            return 0
        referencia = fecha_referencia or date.today()
        return max(0, (referencia - vencimiento).days)

    def marcar_devuelto(self, fecha_devolucion: Optional[date] = None) -> None:
        self.validar_no_devuelto()
        self.estado = EstadoPrestamo.DEVUELTO
        self.fechaDevolucion = fecha_devolucion or date.today()
