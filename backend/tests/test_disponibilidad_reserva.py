import unittest
from datetime import date
from unittest.mock import Mock, patch

from app.application.strategy.devolucion_ejemplar.implementation.devolucion_disponible_strategy import (
    DevolucionDisponibleStrategy,
)
from app.application.use_case.reserva.create_reserva_use_case import CreateReservaUseCase
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.prestamo import Prestamo
from app.domain.entity.reserva import Reserva
from app.domain.error.error_handler import ErrorHandler


class DisponibilidadReservaTest(unittest.TestCase):
    def setUp(self):
        self.reservas, socios, libros, sedes, self.ejemplares, usuarios = (Mock() for _ in range(6))
        self.reservas.save.side_effect = lambda reserva: reserva
        self.ejemplares.get_all_filtered.return_value = []
        self.use_case = CreateReservaUseCase(self.reservas, socios, libros, sedes, self.ejemplares, usuarios)
        auth = patch("app.application.use_case.reserva.create_reserva_use_case.AuthHelper.authenticate")
        auth.start()
        self.addCleanup(auth.stop)

    def test_sin_copias_disponibles_puede_reservar_el_libro_sin_ejemplar(self):
        result = self.use_case.execute(CreateReservaUseCase.Command("token", 1, 2, 3, None))
        self.assertEqual(result.reserva.libro_id, 2)
        self.assertIsNone(result.reserva.ejemplar_id)
        self.assertEqual(result.reserva.fecha, date.today())
        self.ejemplares.get_all_filtered.assert_called_once_with(
            libro_id=2, sede_id=3, estado=EstadoEjemplar.DISPONIBLE
        )

    def test_una_copia_disponible_impide_reservar_incluso_otra_copia_prestada(self):
        self.ejemplares.get_by_id.return_value = Ejemplar(id=5, libro_id=2, sede_id=3, estado=EstadoEjemplar.PRESTADO)
        self.ejemplares.get_all_filtered.return_value = [Ejemplar(id=6, estado=EstadoEjemplar.DISPONIBLE)]
        for copy in (None, 5):
            with self.subTest(copy=copy), self.assertRaises(ErrorHandler) as error:
                self.use_case.execute(CreateReservaUseCase.Command("token", 1, 2, 3, copy))
            self.assertEqual(error.exception.code, "RESERVA_LIBRO_DISPONIBLE")
        self.reservas.save.assert_not_called()

    def test_al_devolver_se_atiende_una_reserva_sin_sede_que_acepta_la_copia(self):
        copia = Ejemplar(id=8, libro_id=2, sede_id=3, estado=EstadoEjemplar.PRESTADO)
        otra_copia = Reserva(id=1, libro_id=2, ejemplar_id=9, estado=EstadoReserva.ACTIVA)
        sin_sede = Reserva(id=2, libro_id=2, estado=EstadoReserva.ACTIVA)
        self.reservas.get_pendientes_for_update.return_value = [sin_sede]
        self.reservas.update.side_effect = lambda _, reserva: reserva
        DevolucionDisponibleStrategy().procesar_devolucion(
            Prestamo(), copia, date.today(), EstadoEjemplar.DISPONIBLE, self.ejemplares, self.reservas
        )
        self.assertEqual(sin_sede.estado, EstadoReserva.LISTA_PARA_RETIRO)
        self.assertEqual(sin_sede.ejemplar_id, 8)
        self.assertEqual(otra_copia.estado, EstadoReserva.ACTIVA)
        self.assertEqual(copia.estado, EstadoEjemplar.RESERVADO)
