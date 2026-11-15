import unittest
from unittest.mock import Mock, patch

from app.application.use_case.socio.create_socio_use_case import CreateSocioUseCase
from app.application.use_case.socio.update_socio_use_case import UpdateSocioUseCase
from app.domain.entity.socio import Socio
from app.domain.error.error_handler import ErrorHandler
from app.presentation.dto.libro.request import CreateLibroReq, UpdateLibroReq


class FormatoLibroSocioTest(unittest.TestCase):
    def setUp(self):
        self.socios = Mock()
        self.socios.get_by_documento.return_value = None
        self.socios.get_by_email.return_value = None
        auth = patch("app.core.helper.auth_helper.AuthHelper.authenticate")
        auth.start()
        self.addCleanup(auth.stop)

    def test_acepta_anio_decimal_y_rechaza_signos_exponentes_y_fracciones(self):
        for build in (
            lambda payload: CreateLibroReq.build(None, payload),
            lambda payload: UpdateLibroReq.build(None, 1, payload),
        ):
            self.assertEqual(build({"añoPublicacion": "1949"}).get_año_publicacion(), 1949)
            for invalid in ("19a9", "+1949", "1e3", 1949.5, True, 0, 9999):
                with self.subTest(invalid=invalid):
                    with self.assertRaises(ErrorHandler) as error:
                        build({"añoPublicacion": invalid})
                    self.assertEqual(error.exception.code, "LIBRO_ANIO_INVALIDO")

    def test_rechaza_datos_invalidos_al_crear_o_modificar_un_socio(self):
        self.socios.get_by_id.return_value = Socio(id=1, nombre="Ana")
        create = CreateSocioUseCase(self.socios, Mock())
        update = UpdateSocioUseCase(self.socios, Mock(), Mock())
        datos = dict(
            nombre="María José",
            apellido="Pérez",
            documento="1234567",
            email="socio@ejemplo.com",
            telefono="1155551234",
        )
        for campo, valor, codigo in (
            ("nombre", "Ana2", "SOCIO_NOMBRE_INVALIDO"),
            ("nombre", "A", "SOCIO_NOMBRE_INVALIDO"),
            ("apellido", "Á" * 101, "SOCIO_NOMBRE_INVALIDO"),
            ("documento", "123456", "SOCIO_DOCUMENTO_INVALIDO"),
            ("documento", "-1234567", "SOCIO_DOCUMENTO_INVALIDO"),
            ("documento", "0000000", "SOCIO_DOCUMENTO_INVALIDO"),
            ("documento", "123456789", "SOCIO_DOCUMENTO_INVALIDO"),
            ("telefono", "12345678901", "SOCIO_TELEFONO_INVALIDO"),
            ("telefono", "11-5555123", "SOCIO_TELEFONO_INVALIDO"),
        ):
            with self.subTest(campo=campo, valor=valor):
                with self.assertRaises(ErrorHandler) as error:
                    create.execute(CreateSocioUseCase.Command("token", **{**datos, campo: valor}))
                self.assertEqual(error.exception.code, codigo)
                with self.assertRaises(ErrorHandler) as error:
                    update.execute(UpdateSocioUseCase.Command("token", 1, **{campo: valor}))
                self.assertEqual(error.exception.code, codigo)
        self.socios.save.assert_not_called()
        self.socios.update.assert_not_called()

    def test_acepta_nombres_compuestos_y_documento_de_siete_u_ocho_digitos(self):
        self.socios.save.side_effect = lambda socio: socio
        create = CreateSocioUseCase(self.socios, Mock())
        for documento in ("1234567", "12345678"):
            socio = create.execute(CreateSocioUseCase.Command(
                "token", "María José", "Pérez", documento, "socio@ejemplo.com", "1155551234",
            )).socio
            self.assertEqual((socio.nombre, socio.documento), ("María José", documento))
