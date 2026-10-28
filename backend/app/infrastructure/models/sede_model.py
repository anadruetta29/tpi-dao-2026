from sqlalchemy import Column, Integer, String, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entities.estado_sede import EstadoSede


class SedeModel(Base):
    __tablename__ = "sedes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(150), nullable=True)
    telefono = Column(String(50), nullable=True)
    email = Column(String(150), nullable=True)
    horarioAtencion = Column(String(100), nullable=True)
    estado = Column(SQLEnum(EstadoSede), nullable=True)
