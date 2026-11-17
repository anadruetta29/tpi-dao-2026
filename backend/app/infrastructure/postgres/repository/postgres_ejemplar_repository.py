from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.infrastructure.postgres.model.devolucion_model import DevolucionModel
from app.infrastructure.postgres.model.ejemplar_model import EjemplarModel
from app.infrastructure.postgres.model.prestamo_model import PrestamoModel
from app.infrastructure.postgres.model.remito_model import RemitoIncidenciaModel, remito_ejemplar_table
from app.infrastructure.postgres.model.reserva_model import ReservaModel
from app.infrastructure.postgres.model.solicitud_prestamo_model import SolicitudPrestamoModel
from app.infrastructure.postgres.repository.base_postgres_repository import BasePostgresRepository


class PostgresEjemplarRepository(BasePostgresRepository[EjemplarModel]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, EjemplarModel)

    def find_all_filtered(
        self,
        libro_id: Optional[int] = None,
        sede_id: Optional[int] = None,
        estado: Optional[EstadoEjemplar] = None,
    ) -> List[EjemplarModel]:
        query = self.db.query(EjemplarModel)
        if libro_id is not None:
            query = query.filter(EjemplarModel.libro_id == libro_id)
        if sede_id is not None:
            query = query.filter(EjemplarModel.sede_id == sede_id)
        if estado is not None:
            query = query.filter(EjemplarModel.estado == estado)
        return query.all()

    def find_by_codigo(self, codigo: str) -> Optional[EjemplarModel]:
        return self.db.query(EjemplarModel).filter(EjemplarModel.codigo == codigo).first()

    @staticmethod
    def delete_by_ids(db: Session, ejemplar_ids: List[int]) -> None:
        if not ejemplar_ids:
            return
        for model in (SolicitudPrestamoModel, PrestamoModel, DevolucionModel, ReservaModel):
            db.query(model).filter(model.ejemplar_id.in_(ejemplar_ids)).update(
                {model.ejemplar_id: None}, synchronize_session=False
            )
        db.execute(
            remito_ejemplar_table.delete().where(remito_ejemplar_table.c.ejemplar_id.in_(ejemplar_ids))
        )
        db.query(RemitoIncidenciaModel).filter(
            RemitoIncidenciaModel.ejemplar_id.in_(ejemplar_ids)
        ).delete(synchronize_session=False)
        db.query(EjemplarModel).filter(EjemplarModel.id.in_(ejemplar_ids)).delete(
            synchronize_session=False
        )

    def delete_by_id(self, id: int) -> bool:
        existing = self.find_by_id(id)
        if not existing:
            return False
        self.delete_by_ids(self.db, [id])
        self.db.commit()
        return True
