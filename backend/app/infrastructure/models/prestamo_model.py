from sqlalchemy import Column, Integer, Date, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entities.estado_prestamo import EstadoPrestamo
from app.domain.entities.modalidad_prestamo_local import ModalidadPrestamoLocal


class PrestamoModel(Base):
    __tablename__ = "prestamos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fechaInicio = Column(Date, nullable=True)
    fechaVencimiento = Column(Date, nullable=True)
    fechaDevolucion = Column(Date, nullable=True)
    estado = Column(SQLEnum(EstadoPrestamo), nullable=True)
    modalidad = Column(SQLEnum(ModalidadPrestamoLocal), nullable=True)
