# AirVision

AirVision is a real-time air quality monitoring project using PySpark streaming, ML predictions, and a FastAPI backend. It collects data from Airly API or simulated sensors and provides interactive visualization through an API. The project demonstrates streaming data processing, machine learning integration, and backend API design in Python.

## Getting Started

### Clone the repository
```bash
git clone https://github.com/yourusername/AirVision.git
cd AirVision
```

### Create and activate a virtual environment
```
python3 -m venv .venv
# .venv\Scripts\activate 
```
### Install dependencies
```
pip install -r requirements.txt
```
### Start the FastAPI backend
```
fastapi dev main.py        
```

### Start the PySpark
```
cd pyspark
python3 application.py
```