from sqlalchemy import Column, Integer, String, Boolean, Enum as SQLEnum
from app.infrastructure.database import Base
from app.domain.entities.rol import Rol


class UsuarioModel(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=True)
    apellido = Column(String(100), nullable=True)
    email = Column(String(150), unique=True, index=True, nullable=True)
    password = Column(String(255), nullable=True)
    activo = Column(Boolean, default=True, nullable=True)
    role = Column(SQLEnum(Rol), nullable=True)
