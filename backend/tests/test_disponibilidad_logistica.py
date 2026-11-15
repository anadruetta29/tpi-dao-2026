import unittest
from datetime import date, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.domain.entity.ejemplar import Ejemplar
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.domain.entity.estado_envio import EstadoEnvio
from app.domain.entity.estado_sede import EstadoSede
from app.domain.entity.sede import Sede
from app.infrastructure.database import Base
from app.infrastructure.postgres.model import HistorialEstadoRemitoModel, RemitoModel
from app.infrastructure.postgres.repository.postgres_remito_repository import PostgresRemitoRepository
from app.infrastructure.repository_adapter.remito_repository_adapter import RemitoRepositoryAdapter
from app.presentation.dto.libro.response.libro_res import GetLibroDisponibilidadRes
from app.presentation.dto.remito.response.remito_res import RemitoRes


class DisponibilidadLogisticaTest(unittest.TestCase):
    def test_monitorea_stock_real_por_sede_e_incluye_sedes_sin_ejemplares(self):
        sedes = [
            Sede(id=1, nombre="Centro", estado=EstadoSede.ACTIVA),
            Sede(id=2, nombre="Sur", estado=EstadoSede.ACTIVA),
            Sede(id=3, nombre="Norte", estado=EstadoSede.BAJA),
        ]
        ejemplares = [
            Ejemplar(id=10, sede_id=1, estado=EstadoEjemplar.DISPONIBLE),
            Ejemplar(id=11, sede_id=1, estado=EstadoEjemplar.PRESTADO),
            Ejemplar(id=12, sede_id=3, estado=EstadoEjemplar.DISPONIBLE),
        ]
        response = GetLibroDisponibilidadRes.from_ejemplares(5, ejemplares, sedes)
        stock = {item.sede_id: (item.sede_nombre, item.disponibles) for item in response.sedes}
        self.assertEqual(stock, {1: ("Centro", 1), 2: ("Sur", 0), 3: ("Norte", 0)})

    def test_listado_remitos_expone_ultimo_estado_dias_y_alcance_de_sede(self):
        engine = create_engine("sqlite://")
        self.addCleanup(engine.dispose)
        Base.metadata.create_all(engine)
        hoy = date.today()
        despacho = hoy - timedelta(days=4)
        with Session(engine) as db:
            db.add_all([
                RemitoModel(id=1, sede_origen_id=1, sede_destino_id=2, fechaDespacho=despacho),
                RemitoModel(id=2, sede_origen_id=2, sede_destino_id=3, fechaDespacho=despacho),
                RemitoModel(id=3, sede_origen_id=1, sede_destino_id=3),
                HistorialEstadoRemitoModel(id=1, remito_id=1, estado=EstadoEnvio.EMPACADO),
                HistorialEstadoRemitoModel(id=2, remito_id=1, estado=EstadoEnvio.EN_TRANSITO),
                HistorialEstadoRemitoModel(id=3, remito_id=2, estado=EstadoEnvio.CON_INCIDENCIA),
            ])
            db.commit()
            repository = RemitoRepositoryAdapter(PostgresRemitoRepository(db))
            remitos = repository.get_all_filtered(sede_recepcionista_id=1)
            response = {item.id: RemitoRes.from_domain(item) for item in remitos}
            self.assertEqual(set(response), {1, 3})
            self.assertEqual(response[1].estado_actual, EstadoEnvio.EN_TRANSITO)
            self.assertEqual(response[1].dias_transito, 4)
            pendientes = repository.get_all_filtered(estado=EstadoEnvio.PENDIENTE, sede_recepcionista_id=1)
            self.assertEqual([item.id for item in pendientes], [3])
