from sqlalchemy import Column, Integer, String, Float
from backend.database.db_init import Base

class DBStation(Base):
    __tablename__ = "stations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    city = Column(String)
    country = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    pm25 = Column(Float)
