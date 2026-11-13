import os


class Settings:
    PORT: int = int(os.getenv("PORT", "8000"))

    DB_USER: str = os.getenv("DB_USER", "develop")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "develop")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "dao")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-jwt-key-change-in-prod")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))


settings = Settings()
