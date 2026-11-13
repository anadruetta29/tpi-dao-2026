from typing import Optional
from app.domain.error.error_type import ErrorType


class ErrorHandler(Exception):
    def __init__(self, error_type: ErrorType, custom_message: Optional[str] = None) -> None:
        self.error_type = error_type
        self.status_code = error_type.status_code
        self.code = error_type.code
        self.message = custom_message or error_type.message
        super().__init__(self.message)
