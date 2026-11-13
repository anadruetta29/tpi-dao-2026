from sqlalchemy import Column, ForeignKey, Integer, Float, Date, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entity.motivo_multa import MotivoMulta
from app.domain.entity.estado_multa import EstadoMulta


class MultaModel(Base):
    __tablename__ = "multas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fechaEmision = Column(Date, nullable=True)
    motivo = Column(SQLEnum(MotivoMulta), nullable=True)
    monto = Column(Float, nullable=True)
    estado = Column(SQLEnum(EstadoMulta), nullable=True)
    fechaPago = Column(Date, nullable=True)
    socio_id = Column(Integer, ForeignKey("socios.id"), nullable=True, index=True)
    prestamo_id = Column(Integer, ForeignKey("prestamos.id"), nullable=True, index=True)
