import os
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.regression import GBTRegressor
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.ml import Pipeline
from pyspark.sql import DataFrame, Window
from pyspark.sql.functions import col, lead

def train_gbt_model(train_data: DataFrame, test_data: DataFrame, horizon: int = 1):
    print(f"Preparing data for training ({horizon}h forecast)...")

    window_spec = Window.partitionBy("location_id").orderBy("timestamp")

    train_data = train_data.withColumn("label", lead(col("pm25"), horizon).over(window_spec))
    test_data  = test_data.withColumn("label",  lead(col("pm25"), horizon).over(window_spec))

    train_data = train_data.dropna(subset=["label"])
    test_data  = test_data.dropna(subset=["label"])

    feature_cols = [
        "pm25", "temperature", "humidity", "pressure", "wind_speed",
        "pm25_rolling_avg_3h", "pm25_rolling_avg_24h",
        "pm25_lag_1h", "pm25_lag_12h", "pm25_lag_24h",
        "temp_lag_6h", "humidity_lag_6h",
        "pm25_diff",
        "hour", "day_of_week",
        "month", "lat" , "lng"
    ]

    assembler = VectorAssembler(inputCols=feature_cols, outputCol="features", handleInvalid="skip")

    gbt = GBTRegressor(
        featuresCol="features",
        labelCol="label",
        lossType="absolute",
        maxIter=100,
        maxDepth=6,
        stepSize=0.05,
        minInstancesPerNode=5,
        seed=42
    )

    pipeline = Pipeline(stages=[assembler, gbt])

    print(f"Training model for {horizon}h...")
    best_model = pipeline.fit(train_data)

    predictions = best_model.transform(test_data)

    ev = RegressionEvaluator(labelCol="label", predictionCol="prediction", metricName="rmse")
    rmse = ev.evaluate(predictions)
    print(f"Results for {horizon}h forecast: RMSE: {rmse:.3f}")

    current_dir=os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(current_dir, "models", f"air_quality_forecasting_{horizon}h")
    best_model.write().overwrite().save(model_dir)

    return best_model

if __name__ == "__main__":
    print("This script is meant to be imported or run with data loading logic.")
    print("Usage: Call train_gbt_model with proper DataFrames and desired horizon.")

