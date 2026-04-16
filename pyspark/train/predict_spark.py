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

def predict():
    input_str = sys.stdin.read()
    if not input_str:
        return

    data = json.loads(input_str)

    spark = SparkSession.builder \
        .master("local[1]") \
        .appName("AirVisionPredict") \
        .getOrCreate()


    model_path = os.path.join(os.path.dirname(__file__), "models", "air_quality_forecasting")
    model = PipelineModel.load(model_path)


    row = Row(**data)
    df = spark.createDataFrame([row])

    predictions = model.transform(df)

    result = predictions.select("prediction").collect()[0][0]

    print(result)

    spark.stop()

if __name__ == "__main__":
    predict()
