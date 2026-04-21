import logging
from sqlalchemy.orm import Session
from backend.utils.predict_spark import call_spark_model
from backend.database.tables.measurement import DBMeasurement
from backend.database.tables.weather import DBWeather
from backend.database.tables.station import DBStation
from sqlalchemy import desc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def prepare_model_input(measurements, weathers, station):
    latest_m = measurements[0]
    latest_w = weathers[0]

    pm25_values = [m.pm25 for m in measurements]
    
    def calculate_mean(values):
        if not values:
            return 0.0
        return sum(values) / len(values)

    avg_3h = calculate_mean(pm25_values[1:4])
    avg_24h = calculate_mean(pm25_values[1:25])

    pm25_lag_1h = pm25_values[1] if len(pm25_values) > 1 else pm25_values[0]
    pm25_lag_12h = pm25_values[12] if len(pm25_values) > 12 else pm25_values[-1]
    pm25_lag_24h = pm25_values[24] if len(pm25_values) > 24 else pm25_values[-1]
    
    temp_values = [w.temperature for w in weathers]
    hum_values = [w.humidity for w in weathers]
    
    temp_lag_6h = temp_values[6] if len(temp_values) > 6 else temp_values[-1]
    humidity_lag_6h = hum_values[6] if len(hum_values) > 6 else hum_values[-1]

    pm25_diff = latest_m.pm25 - (pm25_values[1] if len(pm25_values) > 1 else pm25_values[0])

    ts = latest_m.timestamp
    day_of_week_spark = (ts.weekday() + 1) % 7 + 1
    
    # Kolejność musi być identyczna jak w feature_cols w train_model.py
    return {
        "pm25": float(latest_m.pm25),
        "temperature": float(latest_w.temperature),
        "humidity": float(latest_w.humidity),
        "pressure": float(latest_w.pressure),
        "wind_speed": float(latest_w.wind_speed),
        "pm25_rolling_avg_3h": float(avg_3h),
        "pm25_rolling_avg_24h": float(avg_24h),
        "pm25_lag_1h": float(pm25_lag_1h),
        "pm25_lag_12h": float(pm25_lag_12h),
        "pm25_lag_24h": float(pm25_lag_24h),
        "temp_lag_6h": float(temp_lag_6h),
        "humidity_lag_6h": float(humidity_lag_6h),
        "pm25_diff": float(pm25_diff),
        "hour": int(ts.hour),
        "day_of_week": int(day_of_week_spark),
        "month": int(ts.month),
        "lat": float(station.lat),
        "lng": float(station.lng)
    }

def get_historical_data(db: Session, station_id: int, limit: int = 25):
    measurements = db.query(DBMeasurement) \
        .filter(DBMeasurement.station_id == station_id) \
        .order_by(desc(DBMeasurement.timestamp)).limit(limit).all()
    
    weathers = db.query(DBWeather) \
        .filter(DBWeather.station_id == station_id) \
        .order_by(desc(DBWeather.timestamp)).limit(limit).all()
    
    station = db.query(DBStation).filter(DBStation.id == station_id).first()
    
    return measurements, weathers, station

def predict_pm25_all_horizons(db: Session, station_id: int):
    logger.info(f"Starting prediction for station {station_id}")
    measurements, weathers, station = get_historical_data(db, station_id)
    if not measurements or not weathers or not station:
        logger.warning(f"Insufficient data for station {station_id}")
        return None
    input_data = prepare_model_input(measurements, weathers, station)
    
    results = {}
    for h in [1, 3, 12, 24]:
        try:
            logger.info(f"Calling spark for {h}h")
            results[f"{h}h"] = call_spark_model(input_data, h)
        except Exception as e:
            logger.error(f"Prediction failed for {h}h: {e}")
            results[f"{h}h"] = None
    return results
