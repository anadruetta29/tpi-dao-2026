import unittest
from unittest.mock import Mock, patch

from app.application.use_case.solicitud_prestamo.create_solicitud_interbibliotecaria_use_case import (
    CreateSolicitudInterbibliotecariaUseCase,
)
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler


class SolicitudInterbibliotecariaTest(unittest.TestCase):
    def setUp(self):
        self.solicitudes, ejemplares, sedes, self.usuarios = (Mock() for _ in range(4))
        self.solicitudes.save.side_effect = lambda solicitud: solicitud
        ejemplares.get_by_id.return_value = Ejemplar(id=2, sede_id=3, estado=EstadoEjemplar.DISPONIBLE)
        self.use_case = CreateSolicitudInterbibliotecariaUseCase(self.solicitudes, ejemplares, sedes, self.usuarios)
        self.command = CreateSolicitudInterbibliotecariaUseCase.Command("token", 7, 2, 3, 4)
        auth = patch("app.application.use_case.solicitud_prestamo.create_solicitud_interbibliotecaria_use_case.AuthHelper.authenticate")
        self.authenticate = auth.start()
        self.authenticate.return_value = Usuario(id=12, role=Rol.RECEPCIONISTA, sede_id=4)
        self.addCleanup(auth.stop)

    def test_guarda_al_recepcionista_elegido_como_responsable_de_origen(self):
        self.usuarios.get_by_id.return_value = Usuario(id=7, role=Rol.RECEPCIONISTA, activo=True, sede_id=3)
        result = self.use_case.execute(self.command)
        self.assertEqual(result.solicitud.responsable_origen_id, 7)
        self.assertIsNone(result.solicitud.socio_id)
        self.assertIsNone(result.solicitud.responsable_destino_id)

    def test_admin_activo_puede_ser_responsable_de_origen(self):
        self.usuarios.get_by_id.return_value = Usuario(id=7, role=Rol.ADMIN, activo=True)
        result = self.use_case.execute(self.command)
        self.assertEqual(result.solicitud.responsable_origen_id, 7)
        self.assertIsNone(result.solicitud.socio_id)

    def test_rechaza_usuarios_inactivos_o_con_otro_rol(self):
        for role, activo in [(Rol.MODERADOR, True), (Rol.RECEPCIONISTA, False), (Rol.ADMIN, False)]:
            self.usuarios.get_by_id.return_value = Usuario(id=7, role=role, activo=activo)
            with self.subTest(role=role, activo=activo), self.assertRaises(ErrorHandler) as error:
                self.use_case.execute(self.command)
            self.assertEqual(error.exception.code, "RECEPCIONISTA_INVALIDO")
        self.solicitudes.save.assert_not_called()

    def test_rechaza_solicitud_entre_dos_sedes_ajenas_al_recepcionista(self):
        self.authenticate.return_value = Usuario(id=12, role=Rol.RECEPCIONISTA, sede_id=5)
        with self.assertRaises(ErrorHandler) as error:
            self.use_case.execute(self.command)
        self.assertEqual(error.exception.code, "FORBIDDEN")
        self.solicitudes.save.assert_not_called()

    def test_rechaza_recepcionista_sin_sede_o_de_otra_sede(self):
        for sede_id in (None, 4):
            self.usuarios.get_by_id.return_value = Usuario(id=7, role=Rol.RECEPCIONISTA, sede_id=sede_id)
            with self.subTest(sede_id=sede_id):
                with self.assertRaises(ErrorHandler) as error:
                    self.use_case.execute(self.command)
                self.assertEqual(error.exception.code, "RECEPCIONISTA_INVALIDO")
        self.solicitudes.save.assert_not_called()
