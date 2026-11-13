from typing import Optional


class GetLibroByIdReq:
    def __init__(self, token: Optional[str] = None, id: Optional[int] = None) -> None:
        self.token = token
        self.id = id

    @staticmethod
    def build(token: Optional[str], id: int) -> "GetLibroByIdReq":
        return GetLibroByIdReq(token=token, id=id)

    def get_token(self) -> Optional[str]:
        return self.token

    def get_id(self) -> Optional[int]:
        return self.id
