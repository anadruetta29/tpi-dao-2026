from sqlalchemy import Column, Integer, Date, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entities.estado_envio import EstadoEnvio


class HistorialEstadoRemitoModel(Base):
    __tablename__ = "historiales_estado_remito"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fechaInicio = Column(Date, nullable=True)
    fechaFin = Column(Date, nullable=True)
    estado = Column(SQLEnum(EstadoEnvio), nullable=True)
