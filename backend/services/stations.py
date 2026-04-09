import requests
import os
from sqlalchemy.orm import Session
from backend.database.tables.station import DBStation
import dotenv
import time

dotenv.load_dotenv()

OPENAQ_KEY = os.getenv("OPENAQ_KEY")
OPENAQ_HEADERS = {"X-API-Key": OPENAQ_KEY} if OPENAQ_KEY else {}

EUROPE_COUNTRIES = ["PL", "DE", "GB", "NL", "FR", "IT", "ES", "CZ", "AT", "SE", "GR", "SK"]

def fetch_pm25_stations(db: Session) -> int:
    stations_count = 0
    REQUEST_DELAY = 0.5 

    for country in EUROPE_COUNTRIES:
        print(f"Downloading stations for {country}")
        page = 1
        while True:
            try:
                req = requests.get(
                    "https://api.openaq.org/v3/locations",
                    params={
                        "iso": country,
                        "limit": 500,
                        "page": page
                    },
                    headers=OPENAQ_HEADERS,
                    timeout=10
                )

                if req.status_code == 429:
                    reset = int(req.headers.get("x-ratelimit-reset", 60))
                    print(f"Limit API OpenAQ (429)! Waiting {reset} s...")
                    time.sleep(reset)
                    continue

                req.raise_for_status()
                results = req.json().get("results", [])

                if not results:
                    break

                for loc in results:
                    coords = loc.get("coordinates", {})
                    if not coords:
                        continue

                    sensors = loc.get("sensors", [])
                    pm25_sensor = next((s for s in sensors if s["parameter"]["name"] == "pm25"), None)

                    if pm25_sensor:
                        sensor_id = pm25_sensor["id"]
                        
                        raw_city = loc.get("locality")
                        raw_name = loc.get("name")
                        
                        last_pm25_val = None

                        try:
                            time.sleep(REQUEST_DELAY)
                            
                            while True:
                                meas_req = requests.get(
                                    f"https://api.openaq.org/v3/sensors/{sensor_id}/measurements",
                                    params={"limit": 1},
                                    headers=OPENAQ_HEADERS,
                                    timeout=10
                                )
                                if meas_req.status_code == 429:
                                    reset = int(meas_req.headers.get("x-ratelimit-reset", 60))
                                    print(f"Limit API OpenAQ on sensors (429)! Waiting {reset} s...")
                                    time.sleep(reset)
                                    continue
                                if meas_req.status_code == 200:
                                    meas_data = meas_req.json().get("results", [])
                                    if meas_data:
                                        last_pm25_val = meas_data[0].get("value")
                                break
                        except Exception as sensor_err:
                            print(f"Błąd przy pobieraniu sensora {sensor_id}: {sensor_err}")
                                
                        station_name = raw_name if raw_name else "Unknown Station"
                        fallback_city = raw_city if raw_city else station_name

                        existing_station = db.query(DBStation).filter(DBStation.id == loc["id"]).first()

                        if not existing_station:
                            new_station = DBStation(
                                id=loc["id"],
                                name=station_name,
                                city=fallback_city,
                                country=loc.get("country", {}).get("code", country),
                                lat=coords.get("latitude"),
                                lng=coords.get("longitude"),
                                last_pm25=last_pm25_val
                            )
                            db.add(new_station)
                            stations_count += 1
                        else:
                            existing_station.last_pm25 = last_pm25_val

                db.commit()
                page += 1

            except Exception as e:
                print(f"Error for {country} page : {page}: {e}")
                db.rollback()
                break

    return stations_count
