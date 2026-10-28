from sqlalchemy import Column, Integer, String
from app.infrastructure.database import Base


class AutorModel(Base):
    __tablename__ = "autores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=True)
    apellido = Column(String(100), nullable=True)
