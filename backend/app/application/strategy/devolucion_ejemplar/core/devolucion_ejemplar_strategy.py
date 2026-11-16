from abc import ABC, abstractmethod
from datetime import date
from typing import Optional
from app.application.strategy.calculo_multa.core.calculo_multa_strategy_factory import (
    CalculoMultaStrategyFactory,
)
from app.application.use_case.multa.registrar_multa_por_atraso import registrar_multa_por_atraso
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.multa import Multa
from app.domain.entity.prestamo import Prestamo
from app.domain.repository.ejemplar_repository_i import EjemplarRepositoryI
from app.domain.repository.multa_repository_i import MultaRepositoryI
from app.domain.repository.reserva_repository_i import ReservaRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.tarifa_multa_repository_i import TarifaMultaRepositoryI


class DevolucionEjemplarStrategy(ABC):
    @abstractmethod
    def procesar_devolucion(
        self,
        prestamo: Prestamo,
        ejemplar: Optional[Ejemplar],
        fecha_devolucion: date,
        estado_devuelto: EstadoEjemplar,
        ejemplar_repository: EjemplarRepositoryI,
        reserva_repository: Optional[ReservaRepositoryI] = None,
        multa_repository: Optional[MultaRepositoryI] = None,
        socio_repository: Optional[SocioRepositoryI] = None,
        fecha_atraso: Optional[date] = None,
        tarifa_multa_repository: Optional[TarifaMultaRepositoryI] = None,
    ) -> None:
        pass

    @staticmethod
    def _generar_multa(
        socio_id: Optional[int],
        prestamo_id: Optional[int],
        motivo: MotivoMulta,
        fecha_emision: date,
        dias_atraso: int,
        multa_repository: Optional[MultaRepositoryI],
        socio_repository: Optional[SocioRepositoryI],
        tarifa_multa_repository: Optional[TarifaMultaRepositoryI] = None,
    ) -> None:
        if socio_id is None or multa_repository is None:
            return
        monto = CalculoMultaStrategyFactory(tarifa_multa_repository).get_strategy(motivo).calcular_monto(
            dias_atraso=dias_atraso
        )
        socio = socio_repository.get_by_id_for_update(socio_id) if socio_repository is not None else None
        multa_repository.save(
            Multa(
                fechaEmision=fecha_emision,
                motivo=motivo,
                monto=monto,
                estado=EstadoMulta.PENDIENTE,
                socio_id=socio_id,
                prestamo_id=prestamo_id,
            )
        )
        if socio_repository is not None and socio is not None and socio.id is not None:
            socio.inhabilitar()
            socio_repository.update(socio.id, socio)

    @staticmethod
    def _verificar_entrega_tardia(
        prestamo: Prestamo,
        fecha_devolucion: date,
        multa_repository: Optional[MultaRepositoryI],
        socio_repository: Optional[SocioRepositoryI],
        tarifa_multa_repository: Optional[TarifaMultaRepositoryI] = None,
    ) -> None:
        if prestamo.fechaVencimiento is not None:
            registrar_multa_por_atraso(
                prestamo, fecha_devolucion, multa_repository, socio_repository, tarifa_multa_repository
            )
