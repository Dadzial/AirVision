import requests
import os
from sqlalchemy.orm import Session
from backend.database.tables.station import DBStation
import dotenv
import time
from datetime import datetime, timezone, timedelta

dotenv.load_dotenv()

OPENAQ_KEY = os.getenv("OPENAQ_KEY")
OPENAQ_HEADERS = {"X-API-Key": OPENAQ_KEY} if OPENAQ_KEY else {}

EUROPE_COUNTRIES = ["PL", "DE", "GB", "NL", "FR", "IT", "ES", "CZ", "AT", "SE", "GR", "SK"]

TWO_WEEKS_AGO = datetime.now(timezone.utc) - timedelta(weeks=2)


def _fetch_last_pm25(location_id: int, pm25_sensor_ids: list[int]) -> float | None:
    try:
        req = requests.get(
            f"https://api.openaq.org/v3/locations/{location_id}/latest",
            headers=OPENAQ_HEADERS,
            timeout=10
        )
        if req.status_code != 200:
            return None

        results = req.json().get("results", [])

        best_value = None
        best_datetime = None

        for r in results:
            if r.get("sensorsId") not in pm25_sensor_ids:
                continue

            val = r.get("value")
            if val is None or val < 0:
                continue

            dt_str = (r.get("datetime") or {}).get("utc")
            if not dt_str:
                continue

            try:
                dt = datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
            except ValueError:
                continue

            # Odrzuć odczyty starsze niż 2 tygodnie
            if dt < TWO_WEEKS_AGO:
                continue

            # Weź najnowszy odczyt
            if best_datetime is None or dt > best_datetime:
                best_datetime = dt
                best_value = val

        return best_value

    except Exception as e:
        print(f"Error for loc {location_id}: {e}")
        return None


def fetch_pm25_stations(db: Session) -> int:
    stations_count = 0
    REQUEST_DELAY = 0.5
    two_weeks_ago = datetime.now(timezone.utc) - timedelta(weeks=2)

    valid_station_ids = set()

    for country in EUROPE_COUNTRIES:
        print(f"Downloading stations for {country}")

        for monitor_type in [True, False]:
            page = 1

            while True:
                try:
                    req = requests.get(
                        "https://api.openaq.org/v3/locations",
                        params={
                            "iso": country,
                            "limit": 500,
                            "page": page,
                            "monitor": monitor_type,
                        },
                        headers=OPENAQ_HEADERS,
                        timeout=10
                    )

                    if req.status_code == 429:
                        reset = int(req.headers.get("x-ratelimit-reset", 60))
                        time.sleep(reset)
                        continue

                    req.raise_for_status()
                    results = req.json().get("results", [])

                    if not results:
                        break

                    for loc in results:
                        if not loc:
                            continue

                        datetime_last_str = (loc.get("datetimeLast") or {}).get("utc")
                        if datetime_last_str:
                            try:
                                datetime_last = datetime.strptime(datetime_last_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
                                if datetime_last < two_weeks_ago:
                                    continue
                            except ValueError:
                                pass

                        coords = loc.get("coordinates") or {}
                        if not coords:
                            continue

                        sensors = loc.get("sensors") or []
                        pm25_sensor_ids = [
                            s["id"] for s in sensors
                            if (s.get("parameter") or {}).get("name") == "pm25" and s.get("id")
                        ]

                        if not pm25_sensor_ids:
                            continue

                        time.sleep(REQUEST_DELAY)

                        last_pm25_val = _fetch_last_pm25(loc["id"], pm25_sensor_ids)

                        if last_pm25_val is None:
                            continue

                        raw_city = loc.get("locality")
                        raw_name = loc.get("name")
                        station_name = raw_name if raw_name else "Unknown Station"
                        fallback_city = raw_city if raw_city else station_name

                        existing_station = db.query(DBStation).filter(DBStation.id == loc["id"]).first()

                        if not existing_station:
                            country_code = (loc.get("country") or {}).get("code", country)
                            new_station = DBStation(
                                id=loc["id"],
                                name=station_name,
                                city=fallback_city,
                                country=country_code,
                                lat=coords.get("latitude"),
                                lng=coords.get("longitude"),
                                last_pm25=last_pm25_val
                            )
                            db.add(new_station)
                            stations_count += 1
                        else:
                            existing_station.last_pm25 = last_pm25_val

                        # Oznacz jako prawidłową
                        valid_station_ids.add(loc["id"])

                    db.commit()
                    page += 1

                except Exception as e:
                    print(f"Error dla {country} monitor={monitor_type} strona {page}: {e}")
                    db.rollback()
                    break

    if valid_station_ids:
        all_db_ids = {s.id for s in db.query(DBStation.id).all()}
        ids_to_delete = all_db_ids - valid_station_ids

        if ids_to_delete:
            print(f"Usuwam {len(ids_to_delete)} nieaktualnych stacji...")
            db.query(DBStation).filter(DBStation.id.in_(ids_to_delete)).delete(synchronize_session=False)
            db.commit()

    return stations_count


def update_pm25_only(db: Session) -> int:
    stations = db.query(DBStation).all()
    updated = 0

    for station in stations:
        try:
            loc_req = requests.get(
                f"https://api.openaq.org/v3/locations/{station.id}",
                headers=OPENAQ_HEADERS,
                timeout=10
            )
            if loc_req.status_code == 429:
                reset = int(loc_req.headers.get("x-ratelimit-reset", 60))
                print(f"Rate limit (429)! Czekam {reset}s...")
                time.sleep(reset)
                continue

            if loc_req.status_code != 200:
                continue

            results = loc_req.json().get("results", [])
            if not results:
                continue

            sensors = (results[0] or {}).get("sensors") or []

            pm25_sensor_ids = [
                s["id"] for s in sensors
                if (s.get("parameter") or {}).get("name") == "pm25" and s.get("id")
            ]

            if not pm25_sensor_ids:
                continue

            val = _fetch_last_pm25(station.id, pm25_sensor_ids)
            if val is not None:
                station.last_pm25 = val
                updated += 1

            time.sleep(0.5)

        except Exception as e:
            print(f"Error for {station.id}: {e}")
            continue

    db.commit()
    print(f"update_pm25_only: updated {updated} stations")
    return updated