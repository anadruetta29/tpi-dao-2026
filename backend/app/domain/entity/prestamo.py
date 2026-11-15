from datetime import date
from typing import List, Optional, Union
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
        ejemplar_ids: Optional[List[int]] = None,
        ejemplares_devueltos_ids: Optional[List[int]] = None,
        renovaciones: int = 0,
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
        self.renovaciones = renovaciones
        self.ejemplar_ids = list(dict.fromkeys(ejemplar_ids)) if ejemplar_ids else ([ejemplar_id] if ejemplar_id is not None else [])
        self.ejemplar_id = self.ejemplar_ids[0] if self.ejemplar_ids else None
        self.ejemplares_devueltos_ids = (
            list(ejemplares_devueltos_ids or []) if estado != EstadoPrestamo.DEVUELTO else self.ejemplar_ids.copy()
        )

    def ejemplares_pendientes(self) -> List[int]:
        return [id for id in self.ejemplar_ids if id not in self.ejemplares_devueltos_ids]

    def registrar_ejemplar_devuelto(self, ejemplar_id: int) -> None:
        if ejemplar_id not in self.ejemplares_pendientes():
            raise ErrorHandler(ErrorType.BAD_REQUEST, "El ejemplar no está pendiente de devolución en este préstamo.")
        self.ejemplares_devueltos_ids.append(ejemplar_id)

    def validar_no_devuelto(self) -> None:
        if self.estado == EstadoPrestamo.DEVUELTO:
            raise ErrorHandler(ErrorType.PRESTAMO_ALREADY_RETURNED)

    def _fecha_vencimiento_as_date(self) -> Optional[date]:
        if self.fechaVencimiento is None:
            return None
        if isinstance(self.fechaVencimiento, date):
            return self.fechaVencimiento
        return date.fromisoformat(self.fechaVencimiento)

    def validar_cancelacion_anticipada(self, fecha: date) -> None:
        inicio = self.fechaInicio
        if isinstance(inicio, str):
            inicio = date.fromisoformat(inicio)
        vencimiento = self._fecha_vencimiento_as_date()
        if self.estado != EstadoPrestamo.ACTIVO or inicio is None or vencimiento is None or not inicio <= fecha < vencimiento:
            raise ErrorHandler(ErrorType.PRESTAMO_NO_CANCELABLE)

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
