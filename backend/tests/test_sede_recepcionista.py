import unittest
from unittest.mock import Mock, patch

from app.application.use_case.usuario.create_usuario_use_case import CreateUsuarioUseCase
from app.application.use_case.usuario.update_usuario_use_case import UpdateUsuarioUseCase
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.rol import Rol
from app.domain.entity.sede import Sede
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler


class SedeRecepcionistaTest(unittest.TestCase):
    def setUp(self):
        self.usuarios = Mock()
        self.usuarios.get_by_email.return_value = None
        self.usuarios.save.side_effect = lambda usuario: usuario
        self.usuarios.update.side_effect = lambda id, usuario: usuario
        self.sedes = Mock()
        self.sedes.get_by_id.side_effect = lambda id: Sede(id=id) if id == 3 else None
        auth = patch.object(AuthHelper, "authenticate", return_value=Usuario(role=Rol.ADMIN))
        auth.start()
        self.addCleanup(auth.stop)

    def test_alta_recepcionista_exige_una_sede_existente(self):
        use_case = CreateUsuarioUseCase(self.usuarios, self.sedes)
        data = ("token", "Ana", "Pérez", "ana@example.com", "clave", Rol.RECEPCIONISTA)
        with self.assertRaises(ErrorHandler) as error:
            use_case.execute(use_case.Command(*data))
        self.assertEqual(error.exception.code, "MISSING_REQUIRED_FIELDS")
        with self.assertRaises(ErrorHandler) as error:
            use_case.execute(use_case.Command(*data, sede_id=99))
        self.assertEqual(error.exception.code, "SEDE_NOT_FOUND")
        self.assertEqual(use_case.execute(use_case.Command(*data, sede_id=3)).usuario.sede_id, 3)

    def test_modificar_recepcionista_conserva_su_sede_y_al_cambiar_rol_la_limpia(self):
        use_case = UpdateUsuarioUseCase(self.usuarios, self.sedes)
        self.usuarios.get_by_id.return_value = Usuario(id=1, role=Rol.RECEPCIONISTA, sede_id=3)
        data = ("token", 1, None, None, None, None, None)
        self.assertEqual(use_case.execute(use_case.Command(*data, role=None)).usuario.sede_id, 3)
        self.assertIsNone(use_case.execute(use_case.Command(*data, role=Rol.MODERADOR)).usuario.sede_id)
