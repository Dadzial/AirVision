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
                    has_pm25 = any(s["parameter"]["name"] == "pm25" for s in sensors)

                    if has_pm25:
                        raw_city = loc.get("locality")
                        raw_name = loc.get("name")


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

                            )
                            db.add(new_station)
                            stations_count += 1

                db.commit()
                page += 1

            except Exception as e:
                print(f"Error for {country} page : {page}: {e}")
                db.rollback()
                break

    return stations_count
