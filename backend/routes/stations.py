from fastapi import APIRouter, HTTPException, Depends
from backend.database.db_init import get_db
from backend.database.tables.station import DBStation
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

@router.get("/pm25")
def get_pm25_only(db: Session = Depends(get_db)):
    try:
        rows = db.query(DBStation.id, DBStation.last_pm25).all()
        return {"updates": [{"id": r.id, "last_pm25": r.last_pm25} for r in rows]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync")
def sync_stations(db:Session = Depends(get_db)):
    try:
        added = fetch_pm25_stations(db)
        return {"stations sync is success added :": added}
    except Exception as e:
        return {"error": str(e)}
