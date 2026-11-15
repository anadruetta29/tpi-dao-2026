import asyncio
import logging
from contextlib import asynccontextmanager, suppress
from datetime import date
from typing import AsyncIterator
from fastapi import FastAPI
from app.application.use_case.multa.registrar_multas_vencidas_use_case import RegistrarMultasVencidasUseCase
from app.application.use_case.aviso.enviar_avisos_use_case import EnviarAvisosUseCase
from app.core.bean.dependencies import (
    get_aviso_repository,
    get_generar_avisos_use_case,
    get_registrar_multas_vencidas_use_case,
    get_socio_repository,
    get_vencer_reservas_use_case,
)
from app.core.config.settings import settings
from app.infrastructure.database import SessionLocal, atomic_write
from app.infrastructure.util.enviar_aviso_smtp import enviar_aviso_smtp

logger = logging.getLogger(__name__)


def _registrar_multas_vencidas() -> None:
    with SessionLocal() as db:
        use_case = get_registrar_multas_vencidas_use_case(db)
        use_case.execute(RegistrarMultasVencidasUseCase.Command(fecha=date.today()))


def _vencer_reservas() -> None:
    with SessionLocal() as db:
        get_vencer_reservas_use_case(db).execute(date.today())


def _generar_avisos() -> None:
    with SessionLocal() as db:
        get_generar_avisos_use_case(db).execute(date.today())


def _enviar_avisos() -> None:
    if not settings.AVISO_SMTP_HOST or not settings.AVISO_SMTP_REMITENTE:
        return
    with SessionLocal() as db:
        EnviarAvisosUseCase(
            get_aviso_repository(db), get_socio_repository(db),
            enviar_aviso_smtp, lambda: atomic_write(db),
        ).execute(date.today())


async def _ejecutar_periodicamente() -> None:
    while True:
        for tarea in (_registrar_multas_vencidas, _vencer_reservas, _generar_avisos, _enviar_avisos):
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
