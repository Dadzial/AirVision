from pyspark.sql.datasource import DataSourceStreamReader, DataSource, InputPartition
from pyspark.sql.types import StructType
from typing import Iterator, Tuple
from dotenv import load_dotenv
import requests
import json
from datetime import datetime, timedelta, timezone
import os
import time

load_dotenv()

OPENAQ_KEY = os.getenv("OPENAQ_KEY")
OPENAQ_HEADERS = {"X-API-Key": OPENAQ_KEY}
PARAMETERS = ["pm25"]

COUNTRIES = {
    "PL": {"iso": "PL", "limit": 12},
    "DE": {"iso": "DE", "limit": 12},
    "GB": {"iso": "GB", "limit": 12},
    "NL": {"iso": "NL", "limit": 10},
    "FR": {"iso": "FR", "limit": 10},
    "IT": {"iso": "IT", "limit": 10},
    "ES": {"iso": "ES", "limit": 10},
    "CZ": {"iso": "CZ", "limit": 10},
    "AT": {"iso": "AT", "limit": 10},
    "SE": {"iso": "SE", "limit": 10},
    "GR": {"iso": "GR", "limit": 10},
    "SK": {"iso": "SK", "limit": 10},
}


def fetch_locations_by_country() -> list[dict]:
    all_locations = []
    one_year_ago = datetime.now(timezone.utc) - timedelta(days=365)

    for country_code, config in COUNTRIES.items():
        print(f"Downloading locations: {country_code}...")
        page = 1
        country_locations = []

        while len(country_locations) < config["limit"]:
            while True:
                req = requests.get(
                    "https://api.openaq.org/v3/locations",
                    params={
                        "iso": config["iso"],
                        "limit": 100,
                        "page": page,
                    },
                    headers=OPENAQ_HEADERS
                )
                if req.status_code == 429:
                    reset = int(req.headers.get("x-ratelimit-reset", 60))
                    print(f"429 {country_code} strona {page} — czekam {reset}s...")
                    time.sleep(reset)
                    continue
                req.raise_for_status()
                break

            results = req.json().get("results", [])
            if not results:
                break

            for loc in results:
                if len(country_locations) >= config["limit"]:
                    break
                coords = loc.get("coordinates", {})
                if not coords:
                    continue

                # Pomiń stacje nieaktywne od ponad roku
                datetime_last = loc.get("datetimeLast")
                if not datetime_last:
                    continue
                last_update = datetime.fromisoformat(
                    datetime_last["utc"].replace("Z", "+00:00")
                )
                if last_update < one_year_ago:
                    continue
                sensors = {}
                for s in loc.get("sensors", []):
                    param_name = s["parameter"]["name"]
                    if param_name in PARAMETERS:
                        sensors[param_name] = s["id"]
                if "pm25" not in sensors:
                    continue

                country_locations.append({
                    "location_id": loc["id"],
                    "sensors":     sensors,
                    "name":        loc.get("name", ""),
                    "city":        loc.get("locality", ""),
                    "country":     loc["country"]["code"],
                    "lat":         coords["latitude"],
                    "lng":         coords["longitude"],
                })

            print(f"Page {page} — found {len(country_locations)} active stations {country_code}")

            if len(results) < 100:
                break
            page += 1
            time.sleep(1)

        print(f"{country_code}: found {len(country_locations)} stations")
        all_locations.extend(country_locations)

    print(f"Total: {len(all_locations)} stations")
    return all_locations


def fetch_weather(lat: float, lng: float, date_from: str, date_to: str) -> dict:
    try:
        resp = requests.get(
            "https://archive-api.open-meteo.com/v1/archive",
            params={
                "latitude":   lat,
                "longitude":  lng,
                "start_date": date_from,
                "end_date":   date_to,
                "hourly":     "temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,precipitation",
                "timezone":   "UTC"
            },
            timeout=30
        )
        if resp.status_code != 200:
            return {}
        data = resp.json()
        weather = {}
        for i, ts in enumerate(data["hourly"]["time"]):
            ts_utc = ts + ":00Z"
            weather[ts_utc] = {
                "temperature":   data["hourly"]["temperature_2m"][i],
                "humidity":      data["hourly"]["relative_humidity_2m"][i],
                "pressure":      data["hourly"]["pressure_msl"][i],
                "wind_speed":    data["hourly"]["wind_speed_10m"][i],
                "precipitation": data["hourly"]["precipitation"][i],
            }
        return weather
    except Exception as e:
        print(f"Błąd pogody dla {lat},{lng}: {e}")
        return {}


def fetch_full_location_data(location: dict, days_back: int = 365) -> list[Tuple]:
    date_to   = datetime.now(timezone.utc)
    date_from = date_to - timedelta(days=days_back)

    date_from_str = date_from.strftime("%Y-%m-%d")
    date_to_str   = date_to.strftime("%Y-%m-%d")

    weather = fetch_weather(location["lat"], location["lng"], date_from_str, date_to_str)

    param_data = {}
    for param_name, sensor_id in location["sensors"].items():
        page = 1
        while True:
            while True:
                try:
                    req = requests.get(
                        f"https://api.openaq.org/v3/sensors/{sensor_id}/hours",
                        params={
                            "datetime_from": date_from.strftime("%Y-%m-%dT%H:%M:%SZ"),
                            "datetime_to":   date_to.strftime("%Y-%m-%dT%H:%M:%SZ"),
                            "limit": 1000,
                            "page":  page
                        },
                        headers=OPENAQ_HEADERS,
                        timeout=30
                    )
                except requests.exceptions.ConnectionError:
                    print(f"ConnectionError sensor {sensor_id} strona {page} — czekam 30s...")
                    time.sleep(30)
                    continue

                if req.status_code == 429:
                    reset = int(req.headers.get("x-ratelimit-reset", 60))
                    print(f"429 sensor {sensor_id} strona {page} — czekam {reset}s...")
                    time.sleep(reset)
                    continue
                break

            if req.status_code != 200:
                break

            results = req.json().get("results", [])
            if not results:
                break

            for r in results:
                ts     = r["period"]["datetimeFrom"]["utc"]
                ts_end = r["period"]["datetimeTo"]["utc"]
                if ts not in param_data:
                    param_data[ts] = {"till_datetime": ts_end}
                val = r["value"]
                param_data[ts][param_name] = float(val) if val is not None else None

            if len(results) < 1000:
                break
            time.sleep(0.5)
            page += 1

    rows = []
    for ts in sorted(param_data.keys()):
        d = param_data[ts]
        w = weather.get(ts, {})

        pm25_val = d.get("pm25")
        if pm25_val is None or pm25_val < 0:
            continue


        if not w:
            continue

        rows.append((
            location["location_id"],
            location["lat"],
            location["lng"],
            location["country"],
            location["city"],
            location["name"],
            ts,
            d.get("till_datetime"),
            pm25_val,
            w.get("temperature"),
            w.get("humidity"),
            w.get("pressure"),
            w.get("wind_speed"),
            w.get("precipitation"),
        ))

    print(f"Station {location['location_id']} ({location['city']}, {location['country']}) — {len(rows)} rows")
    return rows


class OpenAQStreamReader(DataSourceStreamReader):

    def __init__(self, schema, options):
        self._schema     = schema
        self._options    = options
        self.days_back   = int(options.get("days_back", 365))
        self.current_off = 0

        locations_json = options.get("locations_json", None)
        if locations_json:
            self._locations = json.loads(locations_json)
            print(f"Załadowano {len(self._locations)} stacji z opcji")
        else:
            self._locations = fetch_locations_by_country()

    def initialOffset(self) -> dict:
        return {"offset": 0}

    def latestOffset(self) -> dict:
        self.current_off += len(self._locations)
        return {"offset": self.current_off}

    def partitions(self, start: dict, end: dict):
        return [InputPartition(i) for i in range(len(self._locations))]

    def read(self, partition) -> Iterator[Tuple]:
        location = self._locations[partition.value]
        rows = fetch_full_location_data(location, self.days_back)
        for row in rows:
            yield row
        time.sleep(1)


class OpenAQDataSource(DataSource):

    @classmethod
    def name(cls) -> str:
        return "openaq"

    def schema(self) -> str:
        return """
            location_id    INT,
            lat            DOUBLE,
            lng            DOUBLE,
            country        STRING,
            city           STRING,
            station_name   STRING,
            from_datetime  STRING,
            till_datetime  STRING,
            pm25           DOUBLE,
            temperature    DOUBLE,
            humidity       DOUBLE,
            pressure       DOUBLE,
            wind_speed     DOUBLE,
            precipitation  DOUBLE
        """

    def streamReader(self, schema: StructType) -> DataSourceStreamReader:
        return OpenAQStreamReader(schema, self.options)