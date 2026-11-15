import unittest
from contextlib import nullcontext
from datetime import date
from unittest.mock import Mock, patch

from app.application.strategy.devolucion_ejemplar.implementation.devolucion_disponible_strategy import (
    DevolucionDisponibleStrategy,
)
from app.application.use_case.multa.pagar_multa_use_case import PagarMultaUseCase
from app.application.use_case.multa.registrar_multas_vencidas_use_case import RegistrarMultasVencidasUseCase
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_multa import EstadoMulta
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.multa import Multa
from app.domain.entity.prestamo import Prestamo
from app.domain.error.error_handler import ErrorHandler
from app.presentation.dto.multa.request.multa_action_req import MultaActionReq


class MultasPorAtrasoTest(unittest.TestCase):
    def setUp(self):
        self.multas = Mock()
        self.socios = Mock()
        self.prestamos = Mock()
        self.prestamo = Prestamo(
            id=1,
            socio_id=2,
            estado=EstadoPrestamo.ACTIVO,
            fechaVencimiento=date(2026, 10, 10),
        )
        self.multas.get_all_by_prestamo_and_motivo_for_update.return_value = []

    def test_devolucion_tardia_crea_multa_de_mil_pesos_por_dia(self):
        DevolucionDisponibleStrategy().procesar_devolucion(
            self.prestamo, None, date(2026, 10, 12), EstadoEjemplar.DISPONIBLE,
            Mock(), multa_repository=self.multas,
        )

        multa = self.multas.save.call_args.args[0]
        self.assertEqual((multa.prestamo_id, multa.monto, multa.estado), (1, 2000, EstadoMulta.PENDIENTE))

    def test_prestamo_sin_socio_acumula_la_multa_vinculada_al_prestamo(self):
        self.prestamo.socio_id = None
        self.prestamos.get_ids_vencidos.return_value = [1]
        self.prestamos.get_by_id_for_update.return_value = self.prestamo
        use_case = RegistrarMultasVencidasUseCase(self.prestamos, self.multas, self.socios, nullcontext)

        use_case.execute(RegistrarMultasVencidasUseCase.Command(date(2026, 10, 11)))

        multa = self.multas.save.call_args.args[0]
        self.assertEqual((multa.prestamo_id, multa.socio_id, multa.monto), (1, None, 1000))
        self.socios.get_by_id_for_update.assert_not_called()

    def test_vencido_acumula_en_la_misma_multa_y_se_liquida_en_la_devolucion(self):
        self.prestamos.get_ids_vencidos.return_value = [1]
        self.prestamos.get_by_id_for_update.return_value = self.prestamo
        use_case = RegistrarMultasVencidasUseCase(self.prestamos, self.multas, self.socios, nullcontext)

        use_case.execute(RegistrarMultasVencidasUseCase.Command(date(2026, 10, 11)))
        multa = self.multas.save.call_args.args[0]
        self.assertEqual(multa.monto, 1000)
        multa.id = 3
        self.multas.get_all_by_prestamo_and_motivo_for_update.return_value = [multa]

        use_case.execute(RegistrarMultasVencidasUseCase.Command(date(2026, 10, 13)))
        self.assertEqual(multa.monto, 3000)
        self.multas.update.assert_called_once_with(3, multa)

        DevolucionDisponibleStrategy().procesar_devolucion(
            self.prestamo, None, date(2026, 10, 14), EstadoEjemplar.DISPONIBLE,
            Mock(), multa_repository=self.multas,
        )
        self.assertEqual(multa.monto, 4000)
        self.multas.save.assert_called_once()

    def test_pago_antes_de_devolver_conserva_lo_pagado_y_solo_genera_la_diferencia(self):
        pagada = Multa(id=3, socio_id=2, monto=2000, estado=EstadoMulta.PAGADA, fechaPago=date(2026, 10, 12))
        self.multas.get_all_by_prestamo_and_motivo_for_update.return_value = [pagada]
        self.prestamos.get_ids_vencidos.return_value = [1]
        self.prestamos.get_by_id_for_update.return_value = self.prestamo
        use_case = RegistrarMultasVencidasUseCase(self.prestamos, self.multas, self.socios, nullcontext)

        use_case.execute(RegistrarMultasVencidasUseCase.Command(date(2026, 10, 12)))
        self.multas.save.assert_not_called()
        use_case.execute(RegistrarMultasVencidasUseCase.Command(date(2026, 10, 15)))

        self.assertEqual((pagada.monto, pagada.estado), (2000, EstadoMulta.PAGADA))
        pendiente = self.multas.save.call_args.args[0]
        self.assertEqual((pendiente.monto, pendiente.estado), (3000, EstadoMulta.PENDIENTE))

    def test_multa_anulada_no_se_regenera(self):
        anulada = Multa(id=3, socio_id=2, monto=1000, estado=EstadoMulta.ANULADA)
        self.multas.get_all_by_prestamo_and_motivo_for_update.return_value = [anulada]
        self.prestamos.get_ids_vencidos.return_value = [1]
        self.prestamos.get_by_id_for_update.return_value = self.prestamo
        use_case = RegistrarMultasVencidasUseCase(self.prestamos, self.multas, self.socios, nullcontext)

        use_case.execute(RegistrarMultasVencidasUseCase.Command(date(2026, 10, 13)))

        self.multas.save.assert_not_called()
        self.multas.update.assert_not_called()

    def test_multa_ajena_al_socio_del_prestamo_no_descuenta_el_atraso(self):
        self.multas.get_all_by_prestamo_and_motivo_for_update.return_value = [
            Multa(id=3, socio_id=99, monto=2000, estado=EstadoMulta.PAGADA)
        ]
        self.prestamos.get_ids_vencidos.return_value = [1]
        self.prestamos.get_by_id_for_update.return_value = self.prestamo
        use_case = RegistrarMultasVencidasUseCase(self.prestamos, self.multas, self.socios, nullcontext)

        use_case.execute(RegistrarMultasVencidasUseCase.Command(date(2026, 10, 12)))

        multa = self.multas.save.call_args.args[0]
        self.assertEqual((multa.socio_id, multa.monto), (2, 2000))

    def test_vencido_revalida_que_el_prestamo_siga_sin_devolucion_al_bloquearlo(self):
        self.prestamos.get_ids_vencidos.return_value = [1]
        self.prestamo.marcar_devuelto(date(2026, 10, 11))
        self.prestamos.get_by_id_for_update.return_value = self.prestamo
        use_case = RegistrarMultasVencidasUseCase(self.prestamos, self.multas, self.socios, nullcontext)

        use_case.execute(RegistrarMultasVencidasUseCase.Command(date(2026, 10, 12)))

        self.multas.save.assert_not_called()

    def test_pago_requiere_fecha_y_no_modifica_multa_si_falta(self):
        self.multas.get_by_id_for_update.return_value = Multa(id=3, estado=EstadoMulta.PENDIENTE)
        use_case = PagarMultaUseCase(self.multas, self.socios, Mock())

        with patch("app.application.use_case.multa.pagar_multa_use_case.AuthHelper.authenticate"):
            with self.assertRaises(ErrorHandler) as error:
                use_case.execute(PagarMultaUseCase.Command("token", 3, None))

        self.assertEqual(error.exception.status_code, 400)
        self.multas.update.assert_not_called()

    def test_dto_conserva_la_fecha_ausente_y_rechaza_una_fecha_invalida(self):
        self.assertIsNone(MultaActionReq.build("token", 3, {}).get_fecha_pago())
        self.assertEqual(MultaActionReq.build("token", 3, {"fechaPago": "2026-10-12"}).get_fecha_pago(), date(2026, 10, 12))
        with self.assertRaises(ErrorHandler) as error:
            MultaActionReq.build("token", 3, {"fechaPago": "2026-02-30"})
        self.assertEqual(error.exception.status_code, 400)
