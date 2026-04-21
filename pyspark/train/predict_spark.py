import sys
import json
import os
import findspark
from pyspark.sql import SparkSession
from pyspark.ml import PipelineModel
from pyspark.sql import Row
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))
os.environ['JAVA_HOME'] = os.getenv("JAVA_HOME")
findspark.init(os.getenv("SPARK_HOME"))

# Te kolumny muszą być w IDENTYCZNEJ kolejności jak w train_model.py
FEATURE_COLS = [
    "pm25", "temperature", "humidity", "pressure", "wind_speed",
    "pm25_rolling_avg_3h", "pm25_rolling_avg_24h",
    "pm25_lag_1h", "pm25_lag_12h", "pm25_lag_24h",
    "temp_lag_6h", "humidity_lag_6h",
    "pm25_diff",
    "hour", "day_of_week",
    "month", "lat", "lng"
]

def predict():
    try:
        horizon = sys.argv[1] if len(sys.argv) > 1 else "1"
        input_str = sys.stdin.read()
        if not input_str:
            sys.stderr.write("No input data provided\n")
            return

        data = json.loads(input_str)

        spark = SparkSession.builder \
            .master("local[1]") \
            .appName("AirVisionPredict") \
            .config("spark.driver.memory", "512m") \
            .config("spark.ui.showConsoleProgress", "false") \
            .getOrCreate()
        

        spark.sparkContext.setLogLevel("ERROR")

        model_path = os.path.join(os.path.dirname(__file__), "models", f"air_quality_forecasting_{horizon}h")
        
        if not os.path.exists(model_path):
            sys.stderr.write(f"CRITICAL ERROR: Model path {model_path} does not exist\n")
            sys.exit(1)

        model = PipelineModel.load(model_path)

        row_dict = {col: data.get(col) for col in FEATURE_COLS}
        row = Row(**row_dict)

        df = spark.createDataFrame([row]).select(*FEATURE_COLS)

        predictions = model.transform(df)

        result = predictions.select("prediction").collect()[0][0]

        print(result)

        spark.stop()
    except Exception as e:
        sys.stderr.write(f"CRITICAL ERROR: {str(e)}\n")
        sys.exit(1)

if __name__ == "__main__":
    predict()
