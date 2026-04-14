import requests
from backend.database.tables.weather import DBWeather
from sqlalchemy.orm import Session
from backend.database.tables.station import DBStation
from datetime import datetime as dt

def fetch_and_store_weather(db: Session, station_id:int,lat: float, lng: float, date_from: str, date_to: str):
    resp = requests.get(
        "https://archive-api.open-meteo.com/v1/archive",
        params={
            "latitude": lat,
            "longitude": lng,
            "start_date": date_from,
            "end_date": date_to,
            "hourly": "temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,precipitation",
            "timezone": "UTC"
        },
        timeout=30
    )
    if resp.status_code != 200:
        return []

    data = resp.json()
    weather_list = []
    for i, ts in enumerate(data["hourly"]["time"]):
        ts_utc = ts + ":00Z"
        weather = DBWeather(
            station_id=station_id,
            lat=lat,
            lng=lng,
            timestamp=dt.fromisoformat(ts_utc.replace("Z", "+00:00")),
            temperature=data["hourly"]["temperature_2m"][i],
            humidity=data["hourly"]["relative_humidity_2m"][i],
            pressure=data["hourly"]["pressure_msl"][i],
            wind_speed=data["hourly"]["wind_speed_10m"][i],
            precipitation=data["hourly"]["precipitation"][i],
        )
        db.add(weather)
        weather_list.append(weather)
    db.commit()
    return weather_list

def fetch_and_store_latest_weather(db: Session, station_id: int):
    station = db.query(DBStation).filter(DBStation.id == station_id).first()
    if station is None:
        return None
    now = dt.utcnow().date().isoformat()
    resp = requests.get(
        "https://archive-api.open-meteo.com/v1/archive",
        params={
            "latitude": station.lat,
            "longitude": station.lng,
            "start_date": now,
            "end_date": now,
            "hourly": "temperature_2m,relative_humidity_2m,pressure_msl,windspeed_10m,precipitation",
            "timezone": "UTC"
        },
        timeout=30
    )
    if resp.status_code != 200:
        return None
    data = resp.json()
    if "hourly" not in data or not all(k in data["hourly"] for k in ["time", "temperature_2m", "relative_humidity_2m", "pressure_msl", "windspeed_10m", "precipitation"]):
        return None
    i = -1
    ts = data["hourly"]["time"][i]
    ts_utc = ts + ":00Z"
    weather = DBWeather(
        station_id=station_id,
        lat=station.lat,
        lng=station.lng,
        timestamp=dt.fromisoformat(ts_utc.replace("Z", "+00:00")),
        temperature=data["hourly"]["temperature_2m"][i],
        humidity=data["hourly"]["relative_humidity_2m"][i],
        pressure=data["hourly"]["pressure_msl"][i],
        wind_speed=data["hourly"]["windspeed_10m"][i],
        precipitation=data["hourly"]["precipitation"][i],
    )
    db.add(weather)
    db.commit()
    db.refresh(weather)
    return weather
