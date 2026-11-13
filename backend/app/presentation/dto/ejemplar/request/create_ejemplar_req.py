from typing import Any, Dict, Optional


class CreateEjemplarReq:
    def __init__(
        self,
        token: Optional[str] = None,
        codigo: Optional[str] = None,
        libro_id: Optional[int] = None,
        sede_id: Optional[int] = None,
    ) -> None:
        self.token = token
        self.codigo = codigo
        self.libro_id = libro_id
        self.sede_id = sede_id

    @staticmethod
    def build(token: Optional[str], payload: Dict[str, Any]) -> "CreateEjemplarReq":
        payload = payload or {}
        return CreateEjemplarReq(
            token=token,
            codigo=str(payload["codigo"]).strip() if payload.get("codigo") is not None else None,
            libro_id=int(payload["libro_id"]) if payload.get("libro_id") is not None else None,
            sede_id=int(payload["sede_id"]) if payload.get("sede_id") is not None else None,
        )

    def get_token(self) -> Optional[str]:
        return self.token

    def get_codigo(self) -> Optional[str]:
        return self.codigo

    def get_libro_id(self) -> Optional[int]:
        return self.libro_id

    def get_sede_id(self) -> Optional[int]:
        return self.sede_id
