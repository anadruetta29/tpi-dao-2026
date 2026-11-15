import unittest
from datetime import date
from unittest.mock import Mock, patch

from app.application.use_case.ejemplar.update_ejemplar_estado_use_case import UpdateEjemplarEstadoUseCase
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.reserva import Reserva
from app.domain.entity.rol import Rol
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler


class EjemplarEstadoTest(unittest.TestCase):
    def setUp(self):
        self.ejemplares = Mock()
        self.usuarios = Mock()
        self.reservas = Mock()
        self.avisos = Mock()
        self.reservas.get_pendientes_for_update.return_value = []
        self.reservas.update.side_effect = lambda id, r: r
        self.ejemplares.update.side_effect = lambda id, ej: ej
        self.use_case = UpdateEjemplarEstadoUseCase(
            self.ejemplares,
            self.usuarios,
            reserva_repository=self.reservas,
            aviso_repository=self.avisos,
        )
        auth = patch("app.core.helper.auth_helper.AuthHelper.authenticate")
        self.auth = auth.start()
        self.auth.return_value = Usuario(id=1, role=Rol.RECEPCIONISTA, sede_id=3)
        self.addCleanup(auth.stop)

    def test_ejemplar_danado_puede_rehabilitarse_a_disponible_y_asigna_reserva(self):
        ejemplar = Ejemplar(id=10, libro_id=5, sede_id=3, estado=EstadoEjemplar.DANADO)
        self.ejemplares.get_by_id_for_update.return_value = ejemplar
        reserva = Reserva(
            id=8, socio_id=2, libro_id=5, sede_id=3, estado=EstadoReserva.ACTIVA, fecha=date.today()
        )
        self.reservas.get_pendientes_for_update.return_value = [reserva]

        result = self.use_case.execute(self.use_case.Command("token", 10, EstadoEjemplar.DISPONIBLE))

        self.assertEqual(result.ejemplar.estado, EstadoEjemplar.RESERVADO)
        self.assertEqual(reserva.estado, EstadoReserva.LISTA_PARA_RETIRO)
        self.reservas.update.assert_called_once_with(8, reserva)
        self.avisos.crear_si_nuevo.assert_called_once()

    def test_ejemplar_en_revision_puede_darse_de_baja_como_destruido(self):
        ejemplar = Ejemplar(id=11, libro_id=5, sede_id=3, estado=EstadoEjemplar.EN_REVISION)
        self.ejemplares.get_by_id_for_update.return_value = ejemplar

        result = self.use_case.execute(self.use_case.Command("token", 11, EstadoEjemplar.DESTRUIDO))

        self.assertEqual(result.ejemplar.estado, EstadoEjemplar.DESTRUIDO)

    def test_no_permite_resolver_ejemplar_prestado_ni_de_otra_sede(self):
        self.ejemplares.get_by_id_for_update.return_value = Ejemplar(
            id=12, libro_id=5, sede_id=3, estado=EstadoEjemplar.PRESTADO
        )
        with self.assertRaises(ErrorHandler):
            self.use_case.execute(self.use_case.Command("token", 12, EstadoEjemplar.DISPONIBLE))

        self.ejemplares.get_by_id_for_update.return_value = Ejemplar(
            id=13, libro_id=5, sede_id=9, estado=EstadoEjemplar.DANADO
        )
        with self.assertRaises(ErrorHandler):
            self.use_case.execute(self.use_case.Command("token", 13, EstadoEjemplar.DISPONIBLE))
