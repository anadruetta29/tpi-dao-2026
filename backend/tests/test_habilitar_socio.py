import unittest
from unittest.mock import Mock, patch

from app.application.use_case.socio.update_socio_use_case import UpdateSocioUseCase
from app.domain.entity.estado_socio import EstadoSocio
from app.domain.entity.socio import Socio
from app.domain.error.error_handler import ErrorHandler


class HabilitarSocioTest(unittest.TestCase):
    def setUp(self):
        self.socio = Socio(id=42, nombre="Ana", estado=EstadoSocio.INHABILITADO)
        self.socios = Mock()
        self.socios.get_by_id.return_value = self.socio
        self.socios.update.side_effect = lambda _, socio: socio
        self.multas = Mock()
        auth = patch("app.application.use_case.socio.update_socio_use_case.AuthHelper.authenticate")
        auth.start()
        self.addCleanup(auth.stop)

    def test_habilita_al_socio_sin_multas_pendientes(self):
        self.multas.has_pending_by_socio.return_value = False
        use_case = UpdateSocioUseCase(self.socios, Mock(), self.multas)
        result = use_case.execute(UpdateSocioUseCase.Command("token", 42, habilitar=True))
        self.assertEqual(result.socio.estado, EstadoSocio.HABILITADO)
        self.assertEqual(result.socio.nombre, "Ana")
        self.socios.update.assert_called_once_with(42, self.socio)

    def test_rechaza_la_habilitacion_si_hay_multas_pendientes(self):
        self.multas.has_pending_by_socio.return_value = True
        use_case = UpdateSocioUseCase(self.socios, Mock(), self.multas)
        with self.assertRaises(ErrorHandler) as error:
            use_case.execute(UpdateSocioUseCase.Command("token", 42, habilitar=True))
        self.assertEqual(error.exception.code, "SOCIO_MULTAS_PENDIENTES")
        self.assertEqual(self.socio.estado, EstadoSocio.INHABILITADO)
        self.socios.update.assert_not_called()
