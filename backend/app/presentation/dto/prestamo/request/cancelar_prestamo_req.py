from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class CancelarPrestamoReq:
    token: Optional[str]
    id: int
