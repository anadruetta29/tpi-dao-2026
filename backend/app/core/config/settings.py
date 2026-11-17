import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PORT: int = int(os.getenv("PORT", "8000"))
    RESERVA_DIAS_RETIRO: int = max(1, int(os.getenv("RESERVA_DIAS_RETIRO", "2")))
    PRESTAMO_DIAS_RENOVACION: int = max(1, int(os.getenv("PRESTAMO_DIAS_RENOVACION", "7")))
    PRESTAMO_MAX_RENOVACIONES: int = max(0, int(os.getenv("PRESTAMO_MAX_RENOVACIONES", "1")))
    AVISO_DIAS_ANTICIPACION: int = max(0, int(os.getenv("AVISO_DIAS_ANTICIPACION", "2")))

    DB_USER: str = os.getenv("DB_USER", "develop")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "develop")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "dao")

    JWT_SECRET: str = os.getenv("JWT_SECRET") or "super-secret-jwt-key-change-in-prod"
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))


settings = Settings()

