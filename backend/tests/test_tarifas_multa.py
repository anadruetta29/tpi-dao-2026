import unittest
from contextlib import nullcontext
from datetime import date
from unittest.mock import Mock

from app.application.strategy.devolucion_ejemplar.implementation.devolucion_con_incidencia_strategy import (
    DevolucionConIncidenciaStrategy,
)
from app.application.use_case.configuracion.get_all_tarifas_multa_use_case import (
    GetAllTarifasMultaUseCase,
)
from app.application.use_case.configuracion.update_tarifa_multa_use_case import (
    UpdateTarifaMultaUseCase,
)
from app.application.use_case.multa.registrar_multa_por_atraso import registrar_multa_por_atraso
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.prestamo import Prestamo
from app.domain.entity.rol import Rol
from app.domain.entity.tarifa_multa import TarifaMulta
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler


class TarifasMultaTest(unittest.TestCase):
    def setUp(self):
        self.tarifas = Mock()
        self.usuarios = Mock()
        self.usuarios.get_by_id.return_value = Usuario(id=1, role=Rol.ADMIN, activo=True)

    def test_solo_admin_puede_consultar_y_actualizar_tarifas(self):
        self.usuarios.get_by_id.return_value = Usuario(id=2, role=Rol.RECEPCIONISTA, activo=True)
        get_uc = GetAllTarifasMultaUseCase(self.tarifas, self.usuarios)
        update_uc = UpdateTarifaMultaUseCase(self.tarifas, self.usuarios, transaction=lambda: nullcontext())

        from app.core.helper.jwt_helper import JwtHelper
        token = JwtHelper.create_token(self.usuarios.get_by_id.return_value)

        with self.assertRaises(ErrorHandler) as ctx1:
            get_uc.execute(GetAllTarifasMultaUseCase.Command(token=token))
        self.assertEqual(ctx1.exception.status_code, 403)

        with self.assertRaises(ErrorHandler) as ctx2:
            update_uc.execute(UpdateTarifaMultaUseCase.Command(token=token, motivo=MotivoMulta.EXTRAVIO, monto=25000))
        self.assertEqual(ctx2.exception.status_code, 403)

    def test_get_all_completa_defaults_y_update_persiste_tarifa(self):
        from app.core.helper.jwt_helper import JwtHelper
        token = JwtHelper.create_token(self.usuarios.get_by_id.return_value)
        self.tarifas.get_all.return_value = [TarifaMulta(motivo=MotivoMulta.ENTREGA_TARDIA, monto=2500.0)]

        res = GetAllTarifasMultaUseCase(self.tarifas, self.usuarios).execute(
            GetAllTarifasMultaUseCase.Command(token=token)
        )
        montos = {item.motivo: item.monto for item in res.tarifas}
        self.assertEqual(montos[MotivoMulta.ENTREGA_TARDIA], 2500.0)
        self.assertEqual(montos[MotivoMulta.EXTRAVIO], 15000.0)
        self.assertEqual(montos[MotivoMulta.DESTRUCCION], 20000.0)

        self.tarifas.save_or_update.side_effect = lambda t: t
        updated = UpdateTarifaMultaUseCase(self.tarifas, self.usuarios).execute(
            UpdateTarifaMultaUseCase.Command(token=token, motivo=MotivoMulta.DESTRUCCION, monto=35000.0)
        )
        self.assertEqual(updated.tarifa.monto, 35000.0)

    def test_calculo_de_multa_usa_tarifa_configurada(self):
        self.tarifas.get_by_motivo.side_effect = lambda m: (
            TarifaMulta(motivo=m, monto=2500.0)
            if m == MotivoMulta.ENTREGA_TARDIA
            else TarifaMulta(motivo=m, monto=30000.0)
        )
        multas = Mock()
        multas.get_all_by_prestamo_and_motivo_for_update.return_value = []
        prestamo = Prestamo(id=1, socio_id=2, estado=EstadoPrestamo.ACTIVO, fechaVencimiento=date(2026, 10, 10))

        registrar_multa_por_atraso(prestamo, date(2026, 10, 12), multas, None, self.tarifas)
        self.assertEqual(multas.save.call_args.args[0].monto, 5000.0)

        DevolucionConIncidenciaStrategy().procesar_devolucion(
            prestamo, None, date(2026, 10, 10), EstadoEjemplar.EXTRAVIADO,
            Mock(), multa_repository=multas, tarifa_multa_repository=self.tarifas,
        )
        self.assertEqual(multas.save.call_args.args[0].monto, 30000.0)
