from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.db_init import get_db
from backend.services.predict import predict_pm25_all_horizons

router = APIRouter()

@router.get("/pm25/predict/{station_id}")
def get_pm25_prediction(station_id: int, db: Session = Depends(get_db)):
    predictions = predict_pm25_all_horizons(db, station_id)
    return predictions if predictions else {"error": "Prediction not available"}