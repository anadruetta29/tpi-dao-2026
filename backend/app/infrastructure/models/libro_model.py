from sqlalchemy import Column, Integer, String
from app.infrastructure.database import Base


class LibroModel(Base):
    __tablename__ = "libros"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    titulo = Column(String(200), nullable=True)
    añoPublicacion = Column(Integer, nullable=True)
    editorial = Column(String(150), nullable=True)
    edicion = Column(String(100), nullable=True)
