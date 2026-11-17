from dataclasses import dataclass
from datetime import date
from typing import Callable, ContextManager, Optional
from app.application.use_case.multa.registrar_multa_por_atraso import registrar_multa_por_atraso
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.repository.multa_repository_i import MultaRepositoryI
from app.domain.repository.prestamo_repository_i import PrestamoRepositoryI
from app.domain.repository.socio_repository_i import SocioRepositoryI
from app.domain.repository.tarifa_multa_repository_i import TarifaMultaRepositoryI


class RegistrarMultasVencidasUseCase:
    def __init__(
        self,
        prestamo_repository: PrestamoRepositoryI,
        multa_repository: MultaRepositoryI,
        socio_repository: SocioRepositoryI,
        transaction: Callable[[], ContextManager],
        tarifa_multa_repository: Optional[TarifaMultaRepositoryI] = None,
    ) -> None:
        self.prestamo_repository = prestamo_repository
        self.multa_repository = multa_repository
        self.socio_repository = socio_repository
        self.transaction = transaction
        self.tarifa_multa_repository = tarifa_multa_repository

    @dataclass(frozen=True)
    class Command:
        fecha: date

    @dataclass(frozen=True)
    class Result:
        procesados: int

    def execute(self, command: Command) -> Result:
        procesados = 0
        with self.transaction():
            prestamo_ids = self.prestamo_repository.get_ids_vencidos(command.fecha)

        for prestamo_id in prestamo_ids:
            with self.transaction():
                prestamo = self.prestamo_repository.get_by_id_for_update(prestamo_id)
                if (
                    prestamo is None
                    or prestamo.fechaDevolucion is not None
                    or prestamo.estado not in (EstadoPrestamo.ACTIVO, EstadoPrestamo.VENCIDO)
                    or not prestamo.esta_vencido(command.fecha)
                ):
                    continue

                registrar_multa_por_atraso(
                    prestamo, command.fecha, self.multa_repository, self.socio_repository, self.tarifa_multa_repository
                )
                if prestamo.estado == EstadoPrestamo.ACTIVO:
                    prestamo.estado = EstadoPrestamo.VENCIDO
                    self.prestamo_repository.update(prestamo_id, prestamo)
                procesados += 1
        return RegistrarMultasVencidasUseCase.Result(procesados=procesados)
