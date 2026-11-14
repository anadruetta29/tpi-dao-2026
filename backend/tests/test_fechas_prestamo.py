import unittest
from datetime import date, timedelta
from unittest.mock import Mock, patch

from app.application.use_case.prestamo.create_prestamo_use_case import CreatePrestamoUseCase
from app.domain.error.error_handler import ErrorHandler


class FechasPrestamoTest(unittest.TestCase):
    def test_rechaza_fechas_invalidas_antes_de_modificar_el_ejemplar(self):
        prestamos, solicitudes, socios, ejemplares, usuarios = (Mock() for _ in range(5))
        use_case = CreatePrestamoUseCase(prestamos, solicitudes, socios, ejemplares, usuarios)
        today = date.today()
        yesterday = today - timedelta(days=1)
        tomorrow = today + timedelta(days=1)

        with patch("app.application.use_case.prestamo.create_prestamo_use_case.AuthHelper.authenticate"):
            for start, end, code in [
                (yesterday, None, "PRESTAMO_INICIO_ANTERIOR"),
                (tomorrow, today, "PRESTAMO_VENCIMIENTO_ANTERIOR"),
            ]:
                with self.subTest(start=start, end=end), self.assertRaises(ErrorHandler) as error:
                    use_case.execute(CreatePrestamoUseCase.Command("token", 1, None, start, end))
                self.assertEqual(error.exception.code, code)

        prestamos.save.assert_not_called()
        ejemplares.update.assert_not_called()

    def test_permite_inicio_y_vencimiento_en_el_dia(self):
        prestamos, solicitudes, socios, ejemplares, usuarios, estados = (Mock() for _ in range(6))
        prestamos.save.side_effect = lambda prestamo: prestamo
        use_case = CreatePrestamoUseCase(prestamos, solicitudes, socios, ejemplares, usuarios, estados)
        today = date.today()
        with patch("app.application.use_case.prestamo.create_prestamo_use_case.AuthHelper.authenticate"):
            result = use_case.execute(CreatePrestamoUseCase.Command("token", 1, None, today, today))

        self.assertEqual(result.prestamo.fechaInicio, today)
        self.assertEqual(result.prestamo.fechaVencimiento, today)
