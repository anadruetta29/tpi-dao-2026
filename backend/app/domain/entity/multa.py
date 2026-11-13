from datetime import date
from typing import Optional, Union
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.error.error_handler import ErrorHandler
from app.domain.error.error_type import ErrorType


class Multa:
    def __init__(
        self,
        id: Optional[int] = None,
        fechaEmision: Optional[Union[date, str]] = None,
        motivo: Optional[MotivoMulta] = None,
        monto: Optional[float] = None,
        estado: Optional[EstadoMulta] = None,
        fechaPago: Optional[Union[date, str]] = None,
        socio_id: Optional[int] = None,
        prestamo_id: Optional[int] = None,
    ) -> None:
        self.id = id
        self.fechaEmision = fechaEmision
        self.motivo = motivo
        self.monto = monto
        self.estado = estado
        self.fechaPago = fechaPago
        self.socio_id = socio_id
        self.prestamo_id = prestamo_id

    def validar_pendiente(self) -> None:
        if self.estado != EstadoMulta.PENDIENTE:
            raise ErrorHandler(ErrorType.MULTA_ALREADY_CLOSED)

    def pagar(self, fecha_pago: Optional[date] = None) -> None:
        self.validar_pendiente()
        self.estado = EstadoMulta.PAGADA
        self.fechaPago = fecha_pago or date.today()

    def anular(self) -> None:
        self.validar_pendiente()
        self.estado = EstadoMulta.ANULADA
