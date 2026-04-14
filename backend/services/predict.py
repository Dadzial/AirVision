from sqlalchemy.orm import Session
from backend.utils.predict_spark import call_spark_model
from backend.database.tables.measurement import DBMeasurement
from backend.database.tables.weather import DBWeather
from sqlalchemy import desc

def prepare_model_input(measurement, weather):
    return {
        "pm25": measurement.pm25,
        "temperature": weather.temperature,
        "humidity": weather.humidity,
        "pressure": weather.pressure,
        "wind_speed": weather.wind_speed,
        "precipitation": weather.precipitation,
    }

def get_latest_measurement_and_weather(db: Session, station_id: int):
    measurement = db.query(DBMeasurement) \
        .filter(DBMeasurement.station_id == station_id) \
        .order_by(desc(DBMeasurement.timestamp)).first()
    weather = db.query(DBWeather) \
        .filter(DBWeather.station_id == station_id) \
        .order_by(desc(DBWeather.timestamp)).first()
    return measurement, weather

def predict_pm25_next_hour(db: Session, station_id: int):
    measurement, weather = get_latest_measurement_and_weather(db, station_id)
    if not measurement or not weather:
        return None
    input_data = prepare_model_input(measurement, weather)
    prediction = call_spark_model(input_data)
    return prediction


