from datetime import date
from typing import List, Optional, Union
from app.domain.entity.motivo_multa import MotivoMulta


class MultaPorMotivoResumen:
    def __init__(
        self,
        motivo: MotivoMulta,
        cantidad: int = 0,
        monto_total: float = 0.0,
        monto_pendiente: float = 0.0,
        monto_pagado: float = 0.0,
    ) -> None:
        self.motivo = motivo
        self.cantidad = cantidad
        self.monto_total = monto_total
        self.monto_pendiente = monto_pendiente
        self.monto_pagado = monto_pagado


class MultasSedeResumen:
    def __init__(
        self,
        sede_id: int,
        sede_nombre: str,
        prestamos_vencidos: int = 0,
        monto_pendiente: float = 0.0,
        monto_pagado: float = 0.0,
        monto_anulado: float = 0.0,
    ) -> None:
        self.sede_id = sede_id
        self.sede_nombre = sede_nombre
        self.prestamos_vencidos = prestamos_vencidos
        self.monto_pendiente = monto_pendiente
        self.monto_pagado = monto_pagado
        self.monto_anulado = monto_anulado


class PrestamoVencidoDetalle:
    def __init__(
        self,
        prestamo_id: int,
        socio_id: int,
        socio_nombre: str,
        socio_documento: str,
        sede_id: int,
        sede_nombre: str,
        fecha_inicio: Optional[Union[date, str]] = None,
        fecha_vencimiento: Optional[Union[date, str]] = None,
        dias_atraso: int = 0,
        cantidad_ejemplares_pendientes: int = 0,
        multa_pendiente_monto: float = 0.0,
    ) -> None:
        self.prestamo_id = prestamo_id
        self.socio_id = socio_id
        self.socio_nombre = socio_nombre
        self.socio_documento = socio_documento
        self.sede_id = sede_id
        self.sede_nombre = sede_nombre
        self.fecha_inicio = fecha_inicio
        self.fecha_vencimiento = fecha_vencimiento
        self.dias_atraso = dias_atraso
        self.cantidad_ejemplares_pendientes = cantidad_ejemplares_pendientes
        self.multa_pendiente_monto = multa_pendiente_monto


class PrestamosVencidosMultasReport:
    def __init__(
        self,
        total_prestamos_vencidos: int = 0,
        promedio_dias_atraso: float = 0.0,
        max_dias_atraso: int = 0,
        total_multas: int = 0,
        monto_total_multas: float = 0.0,
        monto_pendiente: float = 0.0,
        monto_pagado: float = 0.0,
        monto_anulado: float = 0.0,
        por_motivo: Optional[List[MultaPorMotivoResumen]] = None,
        por_sede: Optional[List[MultasSedeResumen]] = None,
        prestamos_vencidos: Optional[List[PrestamoVencidoDetalle]] = None,
    ) -> None:
        self.total_prestamos_vencidos = total_prestamos_vencidos
        self.promedio_dias_atraso = promedio_dias_atraso
        self.max_dias_atraso = max_dias_atraso
        self.total_multas = total_multas
        self.monto_total_multas = monto_total_multas
        self.monto_pendiente = monto_pendiente
        self.monto_pagado = monto_pagado
        self.monto_anulado = monto_anulado
        self.por_motivo = por_motivo if por_motivo is not None else []
        self.por_sede = por_sede if por_sede is not None else []
        self.prestamos_vencidos = prestamos_vencidos if prestamos_vencidos is not None else []
