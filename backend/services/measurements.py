import requests
import os
import dotenv
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from backend.database.tables.measurement import DBMeasurement

dotenv.load_dotenv()

OPENAQ_KEY = os.getenv("OPENAQ_KEY")
OPENAQ_HEADERS = {"X-API-Key": OPENAQ_KEY} if OPENAQ_KEY else {}


def fetch_latest_measurements(station_id: int, db: Session):
    loc_req = requests.get(
        f"https://api.openaq.org/v3/locations/{station_id}",
        headers=OPENAQ_HEADERS
    )
    loc_req.raise_for_status()
    loc_results = loc_req.json().get("results", [])

    if not loc_results:
        return []

    sensors = loc_results[0].get("sensors", [])
    pm25_sensor = next((s for s in sensors if s["parameter"]["name"] == "pm25"), None)

    if not pm25_sensor:
        return []

    pm25_sensor_id = pm25_sensor["id"]

    latest_req = requests.get(
        f"https://api.openaq.org/v3/locations/{station_id}/latest",
        headers=OPENAQ_HEADERS
    )
    latest_req.raise_for_status()
    results = latest_req.json().get("results", [])

    pm25_item = next((r for r in results if r.get("sensorsId") == pm25_sensor_id), None)

    if not pm25_item:
        return []

    val = pm25_item.get("value")
    raw_datetime = pm25_item.get("datetime", {}).get("utc")

    if val is None or raw_datetime is None or val < 0:
        return []

    try:
        parsed_date = datetime.strptime(raw_datetime, "%Y-%m-%dT%H:%M:%SZ")
    except ValueError:
        parsed_date = datetime.fromisoformat(raw_datetime.replace("Z", "+00:00"))

    age = datetime.now(timezone.utc) - parsed_date.replace(tzinfo=timezone.utc)
    if age > timedelta(weeks=2):
        return []

    db_measurement = DBMeasurement(
        station_id=station_id,
        pm25=val,
        timestamp=parsed_date
    )
    db.add(db_measurement)
    db.commit()

    return [{"pm25": val, "datetime": raw_datetime}]


def fetch_last_24h_measurements(station_id: int):
    loc_req = requests.get(
        f"https://api.openaq.org/v3/locations/{station_id}",
        headers=OPENAQ_HEADERS
    )
    loc_req.raise_for_status()
    loc_results = loc_req.json().get("results", [])

    if not loc_results:
        return []

    sensors = loc_results[0].get("sensors", [])
    pm25_sensor = next((s for s in sensors if s["parameter"]["name"] == "pm25"), None)

    if not pm25_sensor:
        return []

    sensor_id = pm25_sensor["id"]

    date_from = (datetime.now(timezone.utc) - timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    hist_req = requests.get(
        f"https://api.openaq.org/v3/sensors/{sensor_id}/hours",
        headers=OPENAQ_HEADERS,
        params={"date_from": date_from, "limit": 24}
    )
    hist_req.raise_for_status()
    results = hist_req.json().get("results", [])

    return [{"pm25": r["value"], "datetime": r.get("period", {}).get("datetimeTo", {}).get("utc")} for r in results if r["value"] >= 0]