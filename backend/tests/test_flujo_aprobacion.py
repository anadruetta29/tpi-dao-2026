import unittest
from datetime import date
from unittest.mock import Mock, patch

from app.application.use_case.prestamo.create_prestamo_use_case import CreatePrestamoUseCase
from app.application.use_case.remito.create_remito_use_case import CreateRemitoUseCase
from app.application.use_case.remito.despacho_remito_use_case import DespachoRemitoUseCase
from app.application.use_case.remito.recepcion_remito_use_case import RecepcionRemitoUseCase
from app.application.use_case.solicitud_prestamo.update_solicitud_estado_use_case import UpdateSolicitudEstadoUseCase
from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.estado_prestamo import EstadoPrestamo
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.rol import Rol
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler


class FlujoAprobacionTest(unittest.TestCase):
    def setUp(self):
        self.solicitudes, self.ejemplares, self.prestamos, self.remitos, self.historial = (
            Mock() for _ in range(5)
        )
        self.ejemplar = Ejemplar(id=2, sede_id=3, estado=EstadoEjemplar.DISPONIBLE)
        self.ejemplares.get_by_id_for_update.return_value = self.ejemplar
        self.solicitud = SolicitudPrestamo(
            id=1, tipo=TipoPrestamo.LOCAL, estado=EstadoSolicitud.PENDIENTE,
            ejemplar_id=2, sede_origen_id=3,
        )
        self.solicitudes.get_by_id_for_update.return_value = self.solicitud
        self.solicitudes.update.side_effect = lambda id, solicitud: solicitud
        self.prestamos.get_by_solicitud_id.return_value = None
        self.prestamos.save.side_effect = lambda prestamo: prestamo
        self.remitos.get_by_solicitud_id.return_value = None
        self.remitos.save.side_effect = self.guardar_remito
        self.remitos.update.side_effect = lambda id, remito: remito
        self.historial.save.side_effect = self.guardar_historial

        socios, sedes, usuarios = (Mock() for _ in range(3))
        crear_prestamo = CreatePrestamoUseCase(
            self.prestamos, self.solicitudes, socios, self.ejemplares, usuarios
        )
        crear_remito = CreateRemitoUseCase(self.remitos, self.historial, sedes, self.ejemplares, usuarios)
        self.aprobar = UpdateSolicitudEstadoUseCase(
            self.solicitudes, self.ejemplares, usuarios,
            crear_prestamo=crear_prestamo, crear_remito=crear_remito,
        )
        self.despachar = DespachoRemitoUseCase(self.remitos, self.historial, self.ejemplares, usuarios)
        self.recibir = RecepcionRemitoUseCase(
            self.remitos, self.historial, self.ejemplares, usuarios,
            solicitud_repository=self.solicitudes, crear_prestamo=crear_prestamo,
        )
        auth = patch("app.core.helper.auth_helper.AuthHelper.authenticate")
        self.auth = auth.start()
        self.auth.return_value = Usuario(id=11, role=Rol.ADMIN)
        self.addCleanup(auth.stop)

    def guardar_remito(self, remito):
        remito.id = 5
        self.remitos.get_by_id_for_update.return_value = remito
        self.remitos.get_by_solicitud_id.return_value = remito
        return remito

    def guardar_historial(self, item):
        item.id = len(self.historial.save.call_args_list)
        self.historial.get_latest_by_remito_id.return_value = item
        return item

    def test_aprobar_solicitud_local_crea_prestamo_activo_hoy_y_bloquea_cancelacion_de_solicitud(self):
        self.aprobar.execute(self.aprobar.Command("token", 1, EstadoSolicitud.APROBADA))
        prestamo = self.prestamos.save.call_args.args[0]
        self.assertEqual(prestamo.estado, EstadoPrestamo.ACTIVO)
        self.assertEqual(prestamo.fechaInicio, date.today())
        self.assertEqual(self.ejemplar.estado, EstadoEjemplar.PRESTADO)
        self.prestamos.get_by_solicitud_id.return_value = prestamo

        with self.assertRaises(ErrorHandler):
            self.aprobar.execute(self.aprobar.Command("token", 1, EstadoSolicitud.CANCELADA))
        self.prestamos.save.assert_called_once()

    def test_aprobacion_local_anterior_puede_completarse_desde_la_solicitud(self):
        self.solicitud.estado = EstadoSolicitud.APROBADA
        self.aprobar.execute(self.aprobar.Command("token", 1, EstadoSolicitud.APROBADA))
        self.assertEqual(self.prestamos.save.call_args.args[0].fechaInicio, date.today())

    def test_interbibliotecario_se_activa_al_recibir_y_guarda_quien_hizo_cada_movimiento(self):
        self.solicitud.tipo = TipoPrestamo.INTERBIBLIOTECARIO
        self.solicitud.sede_destino_id = 4
        self.auth.return_value = Usuario(id=11, role=Rol.RECEPCIONISTA, sede_id=3)
        self.aprobar.execute(self.aprobar.Command("token", 1, EstadoSolicitud.APROBADA))
        self.assertEqual(self.ejemplar.estado, EstadoEjemplar.RESERVADO)
        with self.assertRaises(ErrorHandler):
            self.despachar.execute(self.despachar.Command("token", 5, None))
        self.despachar.empacar(self.despachar.Command("token", 5, None))
        self.despachar.execute(self.despachar.Command("token", 5, None))
        self.prestamos.save.assert_not_called()

        with self.assertRaises(ErrorHandler):
            self.recibir.execute(self.recibir.Command("token", 5, None))
        self.auth.return_value = Usuario(id=12, role=Rol.RECEPCIONISTA, sede_id=4)
        self.recibir.execute(self.recibir.Command("token", 5, None, con_incidencia=True))
        self.prestamos.save.assert_not_called()
        self.recibir.execute(self.recibir.Command("token", 5, None))
        self.assertEqual(self.prestamos.save.call_args.args[0].sede_id, 4)
        self.assertEqual(self.solicitud.responsable_destino_id, 12)
        self.assertEqual(self.ejemplar.estado, EstadoEjemplar.PRESTADO)
        self.assertEqual([(call.args[0].estado, call.args[0].responsable_id) for call in self.historial.save.call_args_list], [
            (EstadoEnvio.ACEPTADO, 11), (EstadoEnvio.EMPACADO, 11),
            (EstadoEnvio.EN_TRANSITO, 11), (EstadoEnvio.CON_INCIDENCIA, 12), (EstadoEnvio.RECIBIDO, 12),
        ])
