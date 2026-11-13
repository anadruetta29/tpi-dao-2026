from app.presentation.controller.auth_controller import AuthController, router as auth_router
from app.presentation.controller.sede_controller import SedeController, router as sede_router
from app.presentation.controller.usuario_controller import UsuarioController, router as usuario_router
from app.presentation.controller.socio_controller import SocioController, router as socio_router
from app.presentation.controller.autor_controller import AutorController, router as autor_router
from app.presentation.controller.libro_controller import LibroController, router as libro_router
from app.presentation.controller.ejemplar_controller import EjemplarController, router as ejemplar_router
from app.presentation.controller.solicitud_prestamo_controller import (
    SolicitudPrestamoController,
    router as solicitud_prestamo_router,
)
from app.presentation.controller.prestamo_controller import PrestamoController, router as prestamo_router
from app.presentation.controller.reserva_controller import ReservaController, router as reserva_router
from app.presentation.controller.remito_controller import RemitoController, router as remito_router
from app.presentation.controller.devolucion_controller import (
    DevolucionController,
    router as devolucion_router,
)
from app.presentation.controller.multa_controller import MultaController, router as multa_router

__all__ = [
    "AuthController",
    "auth_router",
    "SedeController",
    "sede_router",
    "UsuarioController",
    "usuario_router",
    "SocioController",
    "socio_router",
    "AutorController",
    "autor_router",
    "LibroController",
    "libro_router",
    "EjemplarController",
    "ejemplar_router",
    "SolicitudPrestamoController",
    "solicitud_prestamo_router",
    "PrestamoController",
    "prestamo_router",
    "ReservaController",
    "reserva_router",
    "RemitoController",
    "remito_router",
    "DevolucionController",
    "devolucion_router",
    "MultaController",
    "multa_router",
]
