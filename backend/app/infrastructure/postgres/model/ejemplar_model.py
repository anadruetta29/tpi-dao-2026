from sqlalchemy import Column, ForeignKey, Integer, String, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entity.estado_ejemplar import EstadoEjemplar


class EjemplarModel(Base):
    __tablename__ = "ejemplares"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(100), unique=True, index=True, nullable=True)
    estado = Column(SQLEnum(EstadoEjemplar), nullable=True)
    libro_id = Column(Integer, ForeignKey("libros.id"), nullable=True, index=True)
    sede_id = Column(Integer, ForeignKey("sedes.id"), nullable=True, index=True)
