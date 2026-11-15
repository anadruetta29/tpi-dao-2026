import unittest
from datetime import date
from unittest.mock import Mock, patch

from app.application.use_case.devolucion.create_devolucion_use_case import CreateDevolucionUseCase
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.prestamo import Prestamo
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler


class DevolucionesParcialesTest(unittest.TestCase):
    def test_el_prestamo_se_cierra_al_devolver_el_ultimo_ejemplar(self):
        prestamos, ejemplares, devoluciones = (Mock() for _ in range(3))
        hoy = date.today()
        prestamo = Prestamo(
            id=1, estado=EstadoPrestamo.ACTIVO, fechaInicio=hoy, ejemplar_ids=[10, 20],
        )
        copias = {i: Ejemplar(id=i, estado=EstadoEjemplar.PRESTADO) for i in (10, 20)}
        prestamos.get_by_id_for_update.return_value = prestamo
        prestamos.update.side_effect = lambda id, registro: registro
        ejemplares.get_by_id_for_update.side_effect = copias.get
        devoluciones.save.side_effect = lambda registro: registro
        devoluciones.get_ultima_fecha.return_value = hoy
        devolver = CreateDevolucionUseCase(devoluciones, prestamos, ejemplares, Mock())

        with patch.object(AuthHelper, "authenticate", return_value=Usuario(role=Rol.ADMIN)):
            resultado = devolver.execute(devolver.Command("token", 1, hoy, None, None, ejemplar_id=10))
            self.assertEqual(resultado.devolucion.ejemplar_id, 10)
            self.assertEqual(resultado.prestamo.estado, EstadoPrestamo.ACTIVO)
            self.assertIsNone(resultado.prestamo.fechaDevolucion)
            self.assertEqual(copias[20].estado, EstadoEjemplar.PRESTADO)
            with self.assertRaises(ErrorHandler):
                devolver.execute(devolver.Command("token", 1, hoy, None, None, ejemplar_id=10))
            resultado = devolver.execute(devolver.Command(
                "token", 1, hoy, "Requiere revisión", EstadoEjemplar.EN_REVISION, ejemplar_id=20
            ))

        self.assertEqual(resultado.prestamo.estado, EstadoPrestamo.DEVUELTO)
        self.assertEqual(resultado.prestamo.fechaDevolucion, hoy)
        self.assertEqual(resultado.prestamo.ejemplares_devueltos_ids, [10, 20])
        self.assertEqual(copias[20].estado, EstadoEjemplar.EN_REVISION)
        self.assertEqual(devoluciones.save.call_count, 2)
