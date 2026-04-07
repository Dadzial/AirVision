from pydantic import BaseModel
from typing import List, Optional


class Station(BaseModel):
    id: int
    name: str
    city: str
    country: str
    lat: float
    lng: float
    pm25: Optional[float] = None

class StationResponse(BaseModel):
    stations: List[Station]