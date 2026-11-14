import unittest
from datetime import date, timedelta
from unittest.mock import Mock, patch

from app.application.use_case.devolucion.create_devolucion_use_case import CreateDevolucionUseCase
from app.application.use_case.prestamo.cancelar_prestamo_use_case import CancelarPrestamoUseCase
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.prestamo import Prestamo
from app.domain.error.error_handler import ErrorHandler


class CancelarPrestamoTest(unittest.TestCase):
    def setUp(self):
        self.today = date.today()
        self.prestamo = Prestamo(
            id=5, ejemplar_id=8, estado=EstadoPrestamo.ACTIVO,
            fechaInicio=self.today, fechaVencimiento=self.today + timedelta(days=2),
        )
        self.ejemplar = Ejemplar(id=8, estado=EstadoEjemplar.PRESTADO)
        self.prestamos = Mock()
        self.prestamos.get_by_id_for_update.return_value = self.prestamo
        self.prestamos.update.side_effect = lambda _, prestamo: prestamo
        self.ejemplares = Mock()
        self.ejemplares.get_by_id.return_value = self.ejemplar
        self.devoluciones = Mock()
        self.devoluciones.save.side_effect = lambda devolucion: devolucion
        self.use_case = CancelarPrestamoUseCase(
            CreateDevolucionUseCase(self.devoluciones, self.prestamos, self.ejemplares, Mock())
        )
        auth = patch("app.application.use_case.devolucion.create_devolucion_use_case.AuthHelper.authenticate")
        auth.start()
        self.addCleanup(auth.stop)

    def test_cierra_prestamo_registra_devolucion_y_libera_ejemplar_una_sola_vez(self):
        command = CancelarPrestamoUseCase.Command("token", 5)
        result = self.use_case.execute(command)
        self.assertEqual(result.prestamo.estado, EstadoPrestamo.DEVUELTO)
        self.assertEqual(result.prestamo.fechaDevolucion, self.today)
        self.assertEqual(self.ejemplar.estado, EstadoEjemplar.DISPONIBLE)
        devolucion = self.devoluciones.save.call_args.args[0]
        self.assertEqual(devolucion.prestamo_id, 5)
        self.assertEqual(devolucion.observaciones, "Cancelación anticipada del préstamo.")
        with self.assertRaises(ErrorHandler):
            self.use_case.execute(command)
        self.assertEqual(self.devoluciones.save.call_count, 1)

    def test_rechaza_prestamos_que_no_empezaron_o_llegaron_al_vencimiento(self):
        for start, due in [
            (self.today + timedelta(days=1), self.today + timedelta(days=2)),
            (self.today - timedelta(days=1), self.today),
        ]:
            self.prestamo.fechaInicio, self.prestamo.fechaVencimiento = start, due
            with self.subTest(start=start, due=due), self.assertRaises(ErrorHandler) as error:
                self.use_case.execute(CancelarPrestamoUseCase.Command("token", 5))
            self.assertEqual(error.exception.code, "PRESTAMO_NO_CANCELABLE")
        self.devoluciones.save.assert_not_called()
        self.ejemplares.update.assert_not_called()
