import unittest
from unittest.mock import Mock, patch

from app.application.use_case.sede.create_sede_use_case import CreateSedeUseCase
from app.domain.entity.sede import Sede
from app.domain.error.error_handler import ErrorHandler


class HorarioSedeTest(unittest.TestCase):
    def test_alta_rechaza_horarios_invalidos_antes_de_guardar(self):
        repository = Mock()
        repository.get_by_nombre.return_value = None
        use_case = CreateSedeUseCase(repository, Mock())
        with patch("app.application.use_case.sede.create_sede_use_case.AuthHelper.authenticate"):
            for horario in ("9:00 - 17:30", "09:60 - 17:30", "09:00 - 24:00", "17:30 - 09:00", "09:00 - 09:00"):
                with self.subTest(horario=horario), self.assertRaises(ErrorHandler):
                    use_case.execute(CreateSedeUseCase.Command("token", "Central", "123", "sede@example.org", horario))
        repository.save.assert_not_called()

    def test_edicion_conserva_el_horario_anterior_hasta_que_se_reemplaza(self):
        sede = Sede(nombre="Central", horarioAtencion="Lunes a viernes")
        sede.actualizar_datos(nombre="Biblioteca Central")
        self.assertEqual(sede.horarioAtencion, "Lunes a viernes")

        with self.assertRaises(ErrorHandler):
            sede.actualizar_datos(nombre="Otro nombre", horarioAtencion="18:00 - 09:00")
        self.assertEqual(sede.nombre, "Biblioteca Central")
        self.assertEqual(sede.horarioAtencion, "Lunes a viernes")

        sede.actualizar_datos(horarioAtencion="09:00-17:30")
        self.assertEqual(sede.horarioAtencion, "09:00 - 17:30")
