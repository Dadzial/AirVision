from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from backend.database.db_init import Base
import datetime

class DBMeasurement(Base):
    __tablename__ = "measurements"
    id = Column(Integer, primary_key=True, index=True)
    station = relationship("DBStation", back_populates="measurements")
    station_id = Column(Integer, ForeignKey("stations.id"), index=True)
    pm25 = Column(Float)
    timestamp = Column(DateTime, index=True)

