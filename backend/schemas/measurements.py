from pydantic import BaseModel
from typing import List, Optional

class Measurements(BaseModel):
    pm25: float
    datetime: str

class MeasurementsResponse(BaseModel):
    measurements: List[Measurements]
