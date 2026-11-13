from typing import Optional


class GetAllDevolucionesReq:
    def __init__(self, token: Optional[str] = None) -> None:
        self.token = token

    @staticmethod
    def build(token: Optional[str]) -> "GetAllDevolucionesReq":
        return GetAllDevolucionesReq(token=token)

    def get_token(self) -> Optional[str]:
        return self.token
