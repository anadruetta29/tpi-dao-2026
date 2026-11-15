from fastapi import FastAPI
from app.core.handler.exception_handler import register_exception_handlers
from app.presentation.controller.aviso_controller import router as aviso_router
from app.infrastructure.scheduler.multas_vencidas_scheduler import multas_vencidas_lifespan
from app.presentation.controller import (
    auth_router,
    autor_router,
    devolucion_router,
    ejemplar_router,
    libro_router,
    multa_router,
    prestamo_router,
    remito_router,
    reserva_router,
    sede_router,
    socio_router,
    solicitud_prestamo_router,
    usuario_router,
)

app = FastAPI(
    title="Sistema de Préstamos Interbibliotecarios - API",
    version="1.0.0",
    lifespan=multas_vencidas_lifespan,
)

register_exception_handlers(app)

app.include_router(auth_router)
app.include_router(sede_router)
app.include_router(usuario_router)
app.include_router(socio_router)
app.include_router(autor_router)
app.include_router(libro_router)
app.include_router(ejemplar_router)
app.include_router(solicitud_prestamo_router)
app.include_router(prestamo_router)
app.include_router(reserva_router)
app.include_router(remito_router)
app.include_router(devolucion_router)
app.include_router(multa_router)
app.include_router(aviso_router)
