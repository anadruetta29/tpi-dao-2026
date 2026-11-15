import unittest
from unittest.mock import Mock, patch

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.application.use_case.prestamo.get_all_prestamos_use_case import GetAllPrestamosUseCase
from app.application.use_case.prestamo.get_prestamo_by_id_use_case import GetPrestamoByIdUseCase
from app.application.use_case.socio.get_socio_prestamos_use_case import GetSocioPrestamosUseCase
from app.application.use_case.solicitud_prestamo.get_all_solicitudes_prestamo_use_case import (
    GetAllSolicitudesPrestamoUseCase,
)
from app.application.use_case.solicitud_prestamo.get_solicitud_prestamo_by_id_use_case import (
    GetSolicitudPrestamoByIdUseCase,
)
from app.core.helper.auth_helper import AuthHelper
from app.domain.entity.rol import Rol
from app.domain.entity.socio import Socio
from app.domain.entity.tipo_prestamo import TipoPrestamo
from app.domain.entity.usuario import Usuario
from app.domain.error.error_handler import ErrorHandler
from app.infrastructure.postgres.model import PrestamoModel, SolicitudPrestamoModel
from app.infrastructure.postgres.repository.postgres_prestamo_repository import PostgresPrestamoRepository
from app.infrastructure.postgres.repository.postgres_solicitud_prestamo_repository import (
    PostgresSolicitudPrestamoRepository,
)
from app.infrastructure.repository_adapter.prestamo_repository_adapter import PrestamoRepositoryAdapter
from app.infrastructure.repository_adapter.solicitud_prestamo_repository_adapter import (
    SolicitudPrestamoRepositoryAdapter,
)


class PrestamosPorSedeTest(unittest.TestCase):
    def setUp(self):
        engine = create_engine("sqlite://")
        self.addCleanup(engine.dispose)
        SolicitudPrestamoModel.__table__.create(engine)
        PrestamoModel.__table__.create(engine)
        db = Session(engine)
        self.addCleanup(db.close)
        db.add_all([
            SolicitudPrestamoModel(id=1, tipo=TipoPrestamo.LOCAL, sede_origen_id=1),
            SolicitudPrestamoModel(
                id=2, tipo=TipoPrestamo.INTERBIBLIOTECARIO, sede_origen_id=1, sede_destino_id=2,
            ),
            SolicitudPrestamoModel(id=3, tipo=TipoPrestamo.LOCAL, sede_origen_id=2),
            PrestamoModel(id=1, solicitud_id=1, socio_id=1, sede_id=1),
            PrestamoModel(id=2, solicitud_id=2, socio_id=1, sede_id=2),
            PrestamoModel(id=3, solicitud_id=3, socio_id=1, sede_id=2),
        ])
        db.commit()
        self.prestamos = PrestamoRepositoryAdapter(PostgresPrestamoRepository(db))
        self.solicitudes = SolicitudPrestamoRepositoryAdapter(PostgresSolicitudPrestamoRepository(db))
        self.usuarios = Mock()
        self.socios = Mock()
        self.socios.get_by_id.return_value = Socio(id=1)
        self.usuario = Usuario(role=Rol.RECEPCIONISTA, sede_id=1)
        auth = patch.object(AuthHelper, "authenticate", return_value=self.usuario)
        auth.start()
        self.addCleanup(auth.stop)

    def test_recepcionista_solo_lista_su_sede_y_el_filtro_manual_intersecta(self):
        prestamos = GetAllPrestamosUseCase(self.prestamos, self.usuarios)
        solicitudes = GetAllSolicitudesPrestamoUseCase(self.solicitudes, self.usuarios)

        self.assertEqual(
            sorted(p.id for p in prestamos.execute(prestamos.Command("token")).prestamos), [1, 2]
        )
        self.assertEqual(
            [p.id for p in prestamos.execute(prestamos.Command("token", sede_id=2)).prestamos], [2]
        )
        self.assertEqual(
            sorted(s.id for s in solicitudes.execute(solicitudes.Command("token")).solicitudes), [1, 2]
        )
        self.assertEqual(
            [s.id for s in solicitudes.execute(solicitudes.Command("token", sede_id=2)).solicitudes], [2]
        )

    def test_recepcionista_puede_ver_detalle_interbibliotecario_pero_no_ajeno(self):
        prestamos = GetPrestamoByIdUseCase(self.prestamos, self.usuarios)
        solicitudes = GetSolicitudPrestamoByIdUseCase(self.solicitudes, self.usuarios, self.prestamos, Mock())

        self.assertEqual(prestamos.execute(prestamos.Command("token", 2)).prestamo.id, 2)
        self.assertEqual(solicitudes.execute(solicitudes.Command("token", 2)).solicitud.id, 2)
        with self.assertRaises(ErrorHandler) as error:
            prestamos.execute(prestamos.Command("token", 3))
        self.assertEqual(error.exception.code, "PRESTAMO_NOT_FOUND")
        with self.assertRaises(ErrorHandler) as error:
            solicitudes.execute(solicitudes.Command("token", 3))
        self.assertEqual(error.exception.code, "SOLICITUD_NOT_FOUND")

    def test_recepcionista_sin_sede_no_puede_listar(self):
        self.usuario.sede_id = None
        prestamos = GetAllPrestamosUseCase(self.prestamos, self.usuarios)
        solicitudes = GetAllSolicitudesPrestamoUseCase(self.solicitudes, self.usuarios)
        for use_case in (prestamos, solicitudes):
            with self.subTest(use_case=type(use_case).__name__):
                with self.assertRaises(ErrorHandler) as error:
                    use_case.execute(use_case.Command("token"))
                self.assertEqual(error.exception.code, "FORBIDDEN")

    def test_historial_del_socio_respeta_sede_y_el_admin_puede_ver_todas(self):
        prestamos = GetSocioPrestamosUseCase(self.socios, self.prestamos, self.usuarios)
        command = prestamos.Command("token", 1)
        self.assertEqual(sorted(p.id for p in prestamos.execute(command).prestamos), [1, 2])
        self.usuario.role = Rol.ADMIN
        self.assertEqual(sorted(p.id for p in prestamos.execute(command).prestamos), [1, 2, 3])
