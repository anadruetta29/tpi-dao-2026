from sqlalchemy import Column, ForeignKey, Integer, Date, Text, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entity.estado_ejemplar import EstadoEjemplar


class DevolucionModel(Base):
    __tablename__ = "devoluciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha = Column(Date, nullable=True)
    observaciones = Column(Text, nullable=True)
    estadoDevuelto = Column(SQLEnum(EstadoEjemplar), nullable=True)
    prestamo_id = Column(Integer, ForeignKey("prestamos.id"), nullable=True, index=True)
