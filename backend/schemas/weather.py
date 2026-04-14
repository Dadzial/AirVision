from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Weather(BaseModel):
    id: int
    station_id: int
    lat: float
    lng: float
    timestamp: datetime
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    pressure: Optional[float] = None
    wind_speed: Optional[float] = None
    precipitation: Optional[float] = None

class WeatherResponse(BaseModel):
    weather: List[Weather]
