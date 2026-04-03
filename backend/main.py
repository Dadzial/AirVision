from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.db_init import engine, Base
from backend.routes import stations

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

@app.get("/")
def read_root():
    return {"message": "AirVision API"}