from sqlalchemy import Column, ForeignKey, Integer, String, Date, Table
from sqlalchemy.orm import relationship
from app.infrastructure.database import Base

remito_ejemplar_table = Table(
    "remito_ejemplar",
    Base.metadata,
    Column("remito_id", Integer, ForeignKey("remitos.id", ondelete="CASCADE"), primary_key=True),
    Column("ejemplar_id", Integer, ForeignKey("ejemplares.id", ondelete="CASCADE"), primary_key=True),
)


class RemitoModel(Base):
    __tablename__ = "remitos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numero = Column(String(50), unique=True, index=True, nullable=True)
    fechaEmision = Column(Date, nullable=True)
    fechaDespacho = Column(Date, nullable=True)
    fechaRecepcion = Column(Date, nullable=True)
    sede_origen_id = Column(Integer, ForeignKey("sedes.id"), nullable=True, index=True)
    sede_destino_id = Column(Integer, ForeignKey("sedes.id"), nullable=True, index=True)

    ejemplares = relationship("EjemplarModel", secondary=remito_ejemplar_table, lazy="joined")
