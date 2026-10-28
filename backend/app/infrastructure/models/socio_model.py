from sqlalchemy import Column, Integer, String, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entities.estado_socio import EstadoSocio


class SocioModel(Base):
    __tablename__ = "socios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=True)
    apellido = Column(String(100), nullable=True)
    documento = Column(String(50), unique=True, index=True, nullable=True)
    email = Column(String(150), unique=True, index=True, nullable=True)
    telefono = Column(String(50), nullable=True)
    estado = Column(SQLEnum(EstadoSocio), nullable=True)
