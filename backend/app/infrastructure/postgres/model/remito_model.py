from sqlalchemy import Column, Enum as SAEnum, ForeignKey, Integer, String, Date, Table, Text
from sqlalchemy.orm import relationship
from app.domain.entity.estado_ejemplar import EstadoEjemplar
from app.infrastructure.database import Base

remito_ejemplar_table = Table(
    "remito_ejemplar",
    Base.metadata,
    Column("remito_id", Integer, ForeignKey("remitos.id", ondelete="CASCADE"), primary_key=True),
    Column("ejemplar_id", Integer, ForeignKey("ejemplares.id", ondelete="CASCADE"), primary_key=True),
)


class RemitoIncidenciaModel(Base):
    __tablename__ = "remito_incidencias"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    remito_id = Column(Integer, ForeignKey("remitos.id", ondelete="CASCADE"), nullable=False, index=True)
    ejemplar_id = Column(Integer, ForeignKey("ejemplares.id", ondelete="CASCADE"), nullable=False)
    estado = Column(SAEnum(EstadoEjemplar, native_enum=False, length=50), nullable=False)
    observacion = Column(Text, nullable=False)


class RemitoModel(Base):
    __tablename__ = "remitos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numero = Column(String(50), unique=True, index=True, nullable=True)
    fechaEmision = Column(Date, nullable=True)
    fechaDespacho = Column(Date, nullable=True)
    fechaRecepcion = Column(Date, nullable=True)
    sede_origen_id = Column(Integer, ForeignKey("sedes.id"), nullable=True, index=True)
    sede_destino_id = Column(Integer, ForeignKey("sedes.id"), nullable=True, index=True)

    solicitud_id = Column(Integer, ForeignKey("solicitudes_prestamo.id"), nullable=True, unique=True)

    ejemplares = relationship("EjemplarModel", secondary=remito_ejemplar_table, lazy="joined")
    incidencias = relationship("RemitoIncidenciaModel", lazy="joined", cascade="all, delete-orphan")
