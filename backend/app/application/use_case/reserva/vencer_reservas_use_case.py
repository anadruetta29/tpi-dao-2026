from dataclasses import dataclass
from datetime import date
from typing import Callable, ContextManager
from app.application.helper.gestionar_retiro_reserva import GestionarRetiroReserva
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.repository.reserva_repository_i import ReservaRepositoryI


class VencerReservasUseCase:
    def __init__(
        self,
        reserva_repository: ReservaRepositoryI,
        retiro: GestionarRetiroReserva,
        transaction: Callable[[], ContextManager],
    ) -> None:
        self.reserva_repository = reserva_repository
        self.retiro = retiro
        self.transaction = transaction

    @dataclass(frozen=True)
    class Command:
        hoy: date

    @dataclass(frozen=True)
    class Result:
        vencidas: int

    def execute(self, command: Command) -> Result:
        hoy = command.hoy
        vencidas = 0
        with self.transaction():
            ids = self.reserva_repository.get_ids_por_vencer_retiro(hoy)

        for id in ids:
            with self.transaction():
                reserva = self.reserva_repository.get_by_id_for_update(id)
                if reserva is None or reserva.estado != EstadoReserva.LISTA_PARA_RETIRO:
                    continue
                if reserva.fecha_limite_retiro is not None and reserva.fecha_limite_retiro < hoy:
                    self.retiro.liberar(reserva, EstadoReserva.VENCIDA, hoy)
                    vencidas += 1
        return VencerReservasUseCase.Result(vencidas=vencidas)
