import unittest
from unittest.mock import Mock, patch

from app.application.use_case.prestamo.get_all_prestamos_use_case import GetAllPrestamosUseCase
from app.application.use_case.prestamo.get_prestamo_by_id_use_case import GetPrestamoByIdUseCase
from app.application.use_case.reserva.get_all_reservas_use_case import GetAllReservasUseCase
from app.application.use_case.reserva.get_reserva_by_id_use_case import GetReservaByIdUseCase
from app.application.use_case.solicitud_prestamo.get_all_solicitudes_prestamo_use_case import (
    GetAllSolicitudesPrestamoUseCase,
)
from app.application.use_case.solicitud_prestamo.get_solicitud_prestamo_by_id_use_case import (
    GetSolicitudPrestamoByIdUseCase,
)
from app.application.use_case.usuario.create_usuario_use_case import CreateUsuarioUseCase
from app.domain.entity.prestamo import Prestamo
from app.domain.entity.reserva import Reserva
from app.domain.entity.rol import Rol
from app.domain.entity.sede import Sede
from app.domain.entity.solicitud_prestamo import SolicitudPrestamo
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler


class RecepcionistaSedeTest(unittest.TestCase):
    def setUp(self):
        self.usuarios = Mock()
        self.sedes = Mock()
        self.solicitudes = Mock()
        self.prestamos = Mock()
        self.reservas = Mock()
        self.recepcionista = Usuario(id=10, role=Rol.RECEPCIONISTA, activo=True, sede_id=2)
        self.admin = Usuario(id=1, role=Rol.ADMIN, activo=True, sede_id=None)

    def test_create_recepcionista_requiere_sede_existente(self):
        use_case = CreateUsuarioUseCase(self.usuarios, self.sedes)
        self.usuarios.get_by_email.return_value = None
        self.usuarios.save.side_effect = lambda u: u

        with patch("app.application.use_case.usuario.create_usuario_use_case.AuthHelper.authenticate", return_value=self.admin):
            with self.assertRaises(ErrorHandler) as err_missing:
                use_case.execute(
                    CreateUsuarioUseCase.Command(
                        token="tok",
                        nombre="Ana",
                        apellido="Pérez",
                        email="ana@test.com",
                        password="secret",
                        role=Rol.RECEPCIONISTA,
                        sede_id=None,
                    )
                )
            self.assertEqual(err_missing.exception.code, "MISSING_REQUIRED_FIELDS")

            self.sedes.get_by_id.return_value = None
            with self.assertRaises(ErrorHandler) as err_not_found:
                use_case.execute(
                    CreateUsuarioUseCase.Command(
                        token="tok",
                        nombre="Ana",
                        apellido="Pérez",
                        email="ana@test.com",
                        password="secret",
                        role=Rol.RECEPCIONISTA,
                        sede_id=99,
                    )
                )
            self.assertEqual(err_not_found.exception.code, "SEDE_NOT_FOUND")

            self.sedes.get_by_id.return_value = Sede(id=2, nombre="Centro")
            result = use_case.execute(
                CreateUsuarioUseCase.Command(
                    token="tok",
                    nombre="Ana",
                    apellido="Pérez",
                    email="ana@test.com",
                    password="secret",
                    role=Rol.RECEPCIONISTA,
                    sede_id=2,
                )
            )
            self.assertEqual(result.usuario.sede_id, 2)

    def test_recepcionista_filtra_listados_por_su_sede(self):
        self.solicitudes.get_all_filtered.return_value = []
        self.prestamos.get_all_filtered.return_value = []
        self.reservas.get_all_filtered.return_value = []

        with patch("app.core.helper.auth_helper.AuthHelper.authenticate", return_value=self.recepcionista):
            GetAllSolicitudesPrestamoUseCase(self.solicitudes, self.usuarios).execute(
                GetAllSolicitudesPrestamoUseCase.Command(token="tok", sede_id=99)
            )
            self.solicitudes.get_all_filtered.assert_called_with(
                tipo=None, estado=None, sede_id=99, sede_recepcionista_id=2
            )

            GetAllPrestamosUseCase(self.prestamos, self.usuarios).execute(
                GetAllPrestamosUseCase.Command(token="tok", sede_id=99)
            )
            self.prestamos.get_all_filtered.assert_called_with(
                socio_id=None, sede_id=99, estado=None, sede_recepcionista_id=2
            )

            res_reservas = GetAllReservasUseCase(self.reservas, self.usuarios).execute(
                GetAllReservasUseCase.Command(token="tok", sede_id=99)
            )
            self.assertEqual(res_reservas.reservas, [])

            GetAllReservasUseCase(self.reservas, self.usuarios).execute(
                GetAllReservasUseCase.Command(token="tok", sede_id=None)
            )
            self.reservas.get_all_filtered.assert_called_with(libro_id=None, socio_id=None, sede_id=2, estado=None)

    def test_recepcionista_sin_sede_no_puede_listar(self):
        sin_sede = Usuario(id=11, role=Rol.RECEPCIONISTA, activo=True, sede_id=None)
        with patch("app.core.helper.auth_helper.AuthHelper.authenticate", return_value=sin_sede):
            with self.assertRaises(ErrorHandler) as err:
                GetAllPrestamosUseCase(self.prestamos, self.usuarios).execute(
                    GetAllPrestamosUseCase.Command(token="tok")
                )
            self.assertEqual(err.exception.code, "FORBIDDEN")

    def test_recepcionista_solo_accede_a_detalle_de_su_sede(self):
        with patch("app.core.helper.auth_helper.AuthHelper.authenticate", return_value=self.recepcionista):
            self.solicitudes.get_by_id.return_value = SolicitudPrestamo(id=1, sede_origen_id=1, sede_destino_id=2)
            res_sol = GetSolicitudPrestamoByIdUseCase(
                self.solicitudes, self.usuarios, self.prestamos, Mock()
            ).execute(
                GetSolicitudPrestamoByIdUseCase.Command(token="tok", id=1)
            )
            self.assertEqual(res_sol.solicitud.id, 1)

            self.solicitudes.get_by_id.return_value = SolicitudPrestamo(id=2, sede_origen_id=1, sede_destino_id=3)
            with self.assertRaises(ErrorHandler) as err_sol:
                GetSolicitudPrestamoByIdUseCase(
                    self.solicitudes, self.usuarios, self.prestamos, Mock()
                ).execute(
                    GetSolicitudPrestamoByIdUseCase.Command(token="tok", id=2)
                )
            self.assertEqual(err_sol.exception.code, "SOLICITUD_NOT_FOUND")

            self.prestamos.get_by_id.return_value = Prestamo(id=1, sede_id=2)
            res_pre = GetPrestamoByIdUseCase(self.prestamos, self.usuarios).execute(
                GetPrestamoByIdUseCase.Command(token="tok", id=1)
            )
            self.assertEqual(res_pre.prestamo.id, 1)
            self.prestamos.get_by_id.assert_called_with(1, sede_recepcionista_id=2)

            self.prestamos.get_by_id.return_value = None
            with self.assertRaises(ErrorHandler) as err_pre:
                GetPrestamoByIdUseCase(self.prestamos, self.usuarios).execute(
                    GetPrestamoByIdUseCase.Command(token="tok", id=2)
                )
            self.assertEqual(err_pre.exception.code, "PRESTAMO_NOT_FOUND")

            self.reservas.get_by_id.return_value = Reserva(id=1, sede_id=2)
            res_res = GetReservaByIdUseCase(self.reservas, self.usuarios).execute(
                GetReservaByIdUseCase.Command(token="tok", id=1)
            )
            self.assertEqual(res_res.reserva.id, 1)

            self.reservas.get_by_id.return_value = Reserva(id=2, sede_id=3)
            with self.assertRaises(ErrorHandler) as err_res:
                GetReservaByIdUseCase(self.reservas, self.usuarios).execute(
                    GetReservaByIdUseCase.Command(token="tok", id=2)
                )
            self.assertEqual(err_res.exception.code, "RESERVA_NOT_FOUND")
