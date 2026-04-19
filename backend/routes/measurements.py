from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.database.db_init import get_db
from backend.schemas.measurements import MeasurementsResponse
from backend.services.measurements import fetch_latest_measurements
from backend.database.tables.measurement import DBMeasurement

router = APIRouter(prefix="/api/measurements", tags=["measurements"])

@router.get("/{station_id}", response_model=MeasurementsResponse)
def get_station_measurements(station_id: int, db: Session = Depends(get_db)):
    try:
        live_data = fetch_latest_measurements(station_id, db)
        return {"measurements": live_data}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
