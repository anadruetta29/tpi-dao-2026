from typing import Optional


class GetCurrentUserReq:
    def __init__(self, token: Optional[str] = None) -> None:
        self.token = token

    @staticmethod
    def build(token: Optional[str]) -> "GetCurrentUserReq":
        return GetCurrentUserReq(token=token)

    def get_token(self) -> Optional[str]:
        return self.token
