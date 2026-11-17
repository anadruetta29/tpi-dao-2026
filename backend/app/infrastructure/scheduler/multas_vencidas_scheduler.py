import asyncio
import logging
from contextlib import asynccontextmanager, suppress
from datetime import date
from typing import AsyncIterator
from fastapi import FastAPI
from app.application.use_case.aviso.generar_avisos_use_case import GenerarAvisosUseCase
from app.application.use_case.multa.registrar_multas_vencidas_use_case import RegistrarMultasVencidasUseCase
from app.application.use_case.reserva.vencer_reservas_use_case import VencerReservasUseCase
from app.core.bean.dependencies import (
    get_generar_avisos_use_case,
    get_registrar_multas_vencidas_use_case,
    get_vencer_reservas_use_case,
)
from app.infrastructure.database import SessionLocal

logger = logging.getLogger(__name__)


def _registrar_multas_vencidas() -> None:
    with SessionLocal() as db:
        use_case = get_registrar_multas_vencidas_use_case(db)
        use_case.execute(RegistrarMultasVencidasUseCase.Command(fecha=date.today()))


def _vencer_reservas() -> None:
    with SessionLocal() as db:
        get_vencer_reservas_use_case(db).execute(VencerReservasUseCase.Command(hoy=date.today()))


def _generar_avisos() -> None:
    with SessionLocal() as db:
        get_generar_avisos_use_case(db).execute(GenerarAvisosUseCase.Command(hoy=date.today()))


async def _ejecutar_periodicamente() -> None:
    while True:
        for tarea in (_registrar_multas_vencidas, _vencer_reservas, _generar_avisos):
            try:
                await asyncio.to_thread(tarea)
            except Exception:
                logger.exception("Error al ejecutar %s", tarea.__name__)
        await asyncio.sleep(60)


@asynccontextmanager
async def multas_vencidas_lifespan(_app: FastAPI) -> AsyncIterator[None]:
    task = asyncio.create_task(_ejecutar_periodicamente())
    try:
        yield
    finally:
        task.cancel()
        with suppress(asyncio.CancelledError):
            await task
