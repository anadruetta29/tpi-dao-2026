from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.domain.error.error_handler import ErrorHandler


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ErrorHandler)
    async def error_handler_exception_callback(request: Request, exc: ErrorHandler) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": exc.status_code,
                "error": exc.code,
                "message": exc.message,
            },
        )
