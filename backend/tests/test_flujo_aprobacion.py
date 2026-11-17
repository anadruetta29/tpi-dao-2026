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
from app.domain.entity.estado_reserva import EstadoReserva
from app.domain.entity.estado_solicitud import EstadoSolicitud
from app.domain.entity.remito import Remito
from app.domain.entity.reserva import Reserva
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
        self.solicitud.socio_id = 7
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
        self.recibir.execute(self.recibir.Command("token", 5, None))
        self.assertEqual(self.prestamos.save.call_args.args[0].sede_id, 4)
        self.assertEqual(self.solicitud.responsable_destino_id, 12)
        self.assertEqual(self.ejemplar.estado, EstadoEjemplar.PRESTADO)
        self.assertEqual([(call.args[0].estado, call.args[0].responsable_id) for call in self.historial.save.call_args_list], [
            (EstadoEnvio.ACEPTADO, 11), (EstadoEnvio.EMPACADO, 11),
            (EstadoEnvio.EN_TRANSITO, 11), (EstadoEnvio.RECIBIDO, 12),
        ])

    def test_interbibliotecario_sin_socio_no_crea_prestamo_al_recibir(self):
        self.solicitud.tipo = TipoPrestamo.INTERBIBLIOTECARIO
        self.solicitud.socio_id = None
        self.solicitud.sede_destino_id = 4
        remito = Remito(id=5, sede_origen_id=3, sede_destino_id=4, solicitud_id=1, ejemplar_ids=[2])
        self.remitos.get_by_id_for_update.return_value = remito
        self.ejemplar.estado = EstadoEjemplar.EN_TRANSITO
        from app.domain.entity.historial_estado_remito import HistorialEstadoRemito
        self.historial.get_latest_by_remito_id.return_value = HistorialEstadoRemito(
            id=1, estado=EstadoEnvio.EN_TRANSITO, remito_id=5, fechaInicio=date.today()
        )
        self.auth.return_value = Usuario(id=12, role=Rol.RECEPCIONISTA, sede_id=4)
        self.recibir.execute(self.recibir.Command("token", 5, None))
        self.prestamos.save.assert_not_called()
        self.assertEqual(self.ejemplar.sede_id, 4)
        self.assertEqual(self.ejemplar.estado, EstadoEjemplar.DISPONIBLE)
        self.assertEqual(self.solicitud.responsable_destino_id, 12)

    def test_recepcion_con_incidencia_es_final_y_actualiza_ejemplares(self):
        self.solicitud.tipo = TipoPrestamo.INTERBIBLIOTECARIO
        self.solicitud.socio_id = None
        self.solicitud.sede_destino_id = 4
        remito = Remito(id=5, sede_origen_id=3, sede_destino_id=4, solicitud_id=1, ejemplar_ids=[2])
        self.remitos.get_by_id_for_update.return_value = remito
        self.ejemplar.estado = EstadoEjemplar.EN_TRANSITO
        from app.domain.entity.historial_estado_remito import HistorialEstadoRemito
        self.historial.get_latest_by_remito_id.return_value = HistorialEstadoRemito(
            id=1, estado=EstadoEnvio.EN_TRANSITO, remito_id=5, fechaInicio=date.today()
        )
        self.auth.return_value = Usuario(id=12, role=Rol.RECEPCIONISTA, sede_id=4)
        self.recibir.execute(self.recibir.Command(
            "token", 5, None, con_incidencia=True,
            incidencias=[{"ejemplar_id": 2, "estado": "DANADO", "observacion": "Tapa rota"}],
        ))
        self.assertEqual(self.ejemplar.estado, EstadoEjemplar.DANADO)
        self.assertEqual(self.ejemplar.sede_id, 4)
        self.assertEqual(len(remito.incidencias), 1)
        self.assertEqual(remito.incidencias[0].observacion, "Tapa rota")
        self.prestamos.save.assert_not_called()

        self.historial.get_latest_by_remito_id.return_value = HistorialEstadoRemito(
            id=2, estado=EstadoEnvio.CON_INCIDENCIA, remito_id=5, fechaInicio=date.today()
        )
        with self.assertRaises(ErrorHandler):
            self.recibir.execute(self.recibir.Command("token", 5, None))

    def test_recepcion_remito_sin_socio_asigna_reserva_pendiente(self):
        reservas, avisos, usuarios = Mock(), Mock(), Mock()
        ejemplar = Ejemplar(id=2, libro_id=9, sede_id=3, estado=EstadoEjemplar.EN_TRANSITO)
        self.ejemplares.get_by_id_for_update.return_value = ejemplar
        remito = Remito(
            id=5,
            sede_origen_id=3,
            sede_destino_id=4,
            solicitud_id=None,
            ejemplar_ids=[2],
        )
        self.remitos.get_by_id_for_update.return_value = remito
        self.historial.get_latest_by_remito_id.return_value = None
        from app.domain.entity.historial_estado_remito import HistorialEstadoRemito
        self.historial.get_latest_by_remito_id.return_value = HistorialEstadoRemito(
            id=1, estado=EstadoEnvio.EN_TRANSITO, remito_id=5, fechaInicio=date.today()
        )
        reserva = Reserva(
            id=20, socio_id=7, libro_id=9, sede_id=4, estado=EstadoReserva.ACTIVA, fecha=date.today()
        )
        reservas.get_pendientes_for_update.return_value = [reserva]
        reservas.update.side_effect = lambda id, r: r
        recibir = RecepcionRemitoUseCase(
            self.remitos, self.historial, self.ejemplares, usuarios,
            solicitud_repository=self.solicitudes,
            crear_prestamo=Mock(),
            reserva_repository=reservas,
            aviso_repository=avisos,
        )
        self.auth.return_value = Usuario(id=12, role=Rol.RECEPCIONISTA, sede_id=4)

        recibir.execute(recibir.Command("token", 5, date.today()))

        self.assertEqual(ejemplar.sede_id, 4)
        self.assertEqual(ejemplar.estado, EstadoEjemplar.RESERVADO)
        self.assertEqual(reserva.estado, EstadoReserva.LISTA_PARA_RETIRO)
        self.assertEqual(reserva.ejemplar_id, 2)
        reservas.update.assert_called_once_with(20, reserva)
        avisos.crear_si_nuevo.assert_called_once()

    def test_recepcion_con_incidencia_parcial_recibe_resto_disponible(self):
        ejemplar_danado = Ejemplar(id=2, libro_id=9, sede_id=3, estado=EstadoEjemplar.EN_TRANSITO)
        ejemplar_sano = Ejemplar(id=3, libro_id=9, sede_id=3, estado=EstadoEjemplar.EN_TRANSITO)
        ejemplares_por_id = {2: ejemplar_danado, 3: ejemplar_sano}
        self.ejemplares.get_by_id_for_update.side_effect = lambda ej_id: ejemplares_por_id.get(ej_id)
        remito = Remito(id=5, sede_origen_id=3, sede_destino_id=4, solicitud_id=None, ejemplar_ids=[2, 3])
        self.remitos.get_by_id_for_update.return_value = remito
        from app.domain.entity.historial_estado_remito import HistorialEstadoRemito
        self.historial.get_latest_by_remito_id.return_value = HistorialEstadoRemito(
            id=1, estado=EstadoEnvio.EN_TRANSITO, remito_id=5, fechaInicio=date.today()
        )
        self.auth.return_value = Usuario(id=12, role=Rol.RECEPCIONISTA, sede_id=4)

        self.recibir.execute(self.recibir.Command(
            "token", 5, None, con_incidencia=True,
            incidencias=[{"ejemplar_id": 2, "estado": "DANADO", "observacion": "Tapa rota"}],
        ))

        self.assertEqual(ejemplar_danado.estado, EstadoEjemplar.DANADO)
        self.assertEqual(ejemplar_danado.sede_id, 4)
        self.assertEqual(ejemplar_sano.estado, EstadoEjemplar.DISPONIBLE)
        self.assertEqual(ejemplar_sano.sede_id, 4)
        self.assertEqual(len(remito.incidencias), 1)
        self.assertEqual(remito.incidencias[0].ejemplar_id, 2)
        self.assertEqual(remito.incidencias[0].observacion, "Tapa rota")
