from fastapi import APIRouter, Depends, Query
from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.database.db_init import get_db
from backend.database.tables.weather import DBWeather
from backend.database.tables.station import DBStation
from backend.services.weather import fetch_and_store_weather, fetch_and_store_latest_weather
from backend.schemas.weather import Weather

router = APIRouter(prefix="/api/weather", tags=["Weather"])

@router.get("/station/{station_id}", response_model=list[Weather])
def get_weather_for_station(
        station_id: int,
        lat: float = Query(...),
        lng: float = Query(...),
        date_from: str = Query(...),
        date_to: str = Query(...),
        db: Session = Depends(get_db)
):
    fetch_and_store_weather(db, station_id, lat, lng, date_from, date_to)
    return db.query(DBWeather).filter(DBWeather.station_id == station_id).all()

@router.get("/station/{station_id}/latest", response_model=Weather)
def get_latest_weather_for_station(
        station_id: int,
        db: Session = Depends(get_db)
):
    weather = fetch_and_store_latest_weather(db, station_id)
    if weather is None:
        raise HTTPException(status_code=404, detail="No weather data found for this station")
    return weather
