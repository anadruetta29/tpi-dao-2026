from typing import Optional


class GetAllAutoresReq:
    def __init__(self, token: Optional[str] = None) -> None:
        self.token = token

    @staticmethod
    def build(token: Optional[str]) -> "GetAllAutoresReq":
        return GetAllAutoresReq(token=token)

    def get_token(self) -> Optional[str]:
        return self.token
