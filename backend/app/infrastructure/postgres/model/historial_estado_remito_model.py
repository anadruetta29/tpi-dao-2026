from sqlalchemy import Column, ForeignKey, Integer, Date, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entity.estado_envio import EstadoEnvio


class HistorialEstadoRemitoModel(Base):
    __tablename__ = "historiales_estado_remito"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fechaInicio = Column(Date, nullable=True)
    fechaFin = Column(Date, nullable=True)
    estado = Column(SQLEnum(EstadoEnvio), nullable=True)
    remito_id = Column(Integer, ForeignKey("remitos.id", ondelete="CASCADE"), nullable=True, index=True)
