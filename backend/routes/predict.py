from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.db_init import get_db
from backend.services.predict import predict_pm25_next_hour

router = APIRouter()

@router.get("/pm25/next_hour/{station_id}")
def get_pm25_prediction(station_id: int, db: Session = Depends(get_db)):
    prediction = predict_pm25_next_hour(db, station_id)
    return {"pm25_next_hour": prediction}