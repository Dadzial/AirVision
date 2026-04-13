from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from backend.database.db_init import engine, Base, get_db
from backend.services.stations import update_pm25_only
from backend.routes import stations
from backend.routes import measurements

Base.metadata.create_all(bind=engine)
app = FastAPI(title="AirVision API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stations.router)
app.include_router(measurements.router)

def scheduled_update():
    db = next(get_db())
    try:
        updated = update_pm25_only(db)
        print(f"Scheduler: update {updated} stations")
    except Exception as e:
        print(f"Scheduler error: {e}")
    finally:
        db.close()


scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_update, "interval", hours=1)
scheduler.start()

@app.get("/")
def read_root():
    return {"message": "AirVision API"}