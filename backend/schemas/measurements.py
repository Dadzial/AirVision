from pydantic import BaseModel
from typing import List

class Measurements(BaseModel):
    pm25: float
    datetime: str

class MeasurementsResponse(BaseModel):
    measurements: List[Measurements]
