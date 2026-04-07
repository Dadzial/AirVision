# backend/services/measurements.py
import requests
import os
import dotenv
from sqlalchemy.orm import Session
from datetime import datetime

from backend.database.tables.measurement import DBMeasurement

dotenv.load_dotenv()

OPENAQ_KEY = os.getenv("OPENAQ_KEY")
OPENAQ_HEADERS = {"X-API-Key": OPENAQ_KEY} if OPENAQ_KEY else {}

def fetch_latest_measurements(station_id: int, db: Session):
    url = f"https://api.openaq.org/v3/locations/{station_id}/latest"

    req = requests.get(url, headers=OPENAQ_HEADERS)
    req.raise_for_status()
    results = req.json().get("results", [])

    processed_data = []

    for item in results:
        val = item.get("value")
        raw_datetime = item.get("datetime", {}).get("utc")

        if val is None or raw_datetime is None:
            continue

        parsed_date = datetime.strptime(raw_datetime, "%Y-%m-%dT%H:%M:%SZ")

        db_measurement = DBMeasurement(
            station_id=station_id,
            pm25=val,
            timestamp=parsed_date
        )
        db.add(db_measurement)

        processed_data.append({
            "pm25": val,
            "datetime": raw_datetime
        })

    db.commit()

    return processed_data
