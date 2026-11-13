from datetime import date
from typing import Optional, Union
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.modalidad_prestamo_local import ModalidadPrestamoLocal


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
