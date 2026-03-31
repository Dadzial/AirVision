from fastapi import APIRouter, HTTPException, Depends
from backend.services.stations import fetch_pm25_stations
from backend.schemas.stations import StationResponse
from backend.database.db_init import get_db
from backend.models.station import DBStation
from backend.schemas.stations import StationResponse
from sqlalchemy.orm import Session

from backend.services.stations import fetch_pm25_stations

router = APIRouter(prefix="/api/stations", tags=["Stations"])

@router.get("", response_model=StationResponse)
def get_stations(db:Session = Depends(get_db)):
    try:
        db_stations = db.query(DBStation).all()
        return {"stations": db_stations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error server: {str(e)}")

@router.post("/sync")
def sync_stations(db:Session = Depends(get_db)):
    try:
        added = fetch_pm25_stations(db)
        return {"stations sync is success added :": added}
    except Exception as e:
        return {"error": str(e)}
