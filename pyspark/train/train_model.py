from pyspark.ml.feature import VectorAssembler
from pyspark.ml.regression import GBTRegressor
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.ml import Pipeline
from pyspark.sql import DataFrame, Window
from pyspark.sql.functions import col, lead

def train_gbt_model(df: DataFrame):
    print("Preparing data for training (24h forecast)...")

    window_spec = Window.partitionBy("location_id").orderBy("timestamp")
    df_with_label = df.withColumn("label", lead(col("pm25"), 24).over(window_spec))

    train_ready_df = df_with_label.dropna(subset=["label"])

    feature_cols = [
        "pm25", "temperature", "humidity", "pressure", "wind_speed",
        "pm25_rolling_avg_3h", "pm25_rolling_avg_24h", "pm25_diff",
        "hour", "day_of_week"
    ]

    assembler = VectorAssembler(inputCols=feature_cols, outputCol="features")

    gbt = GBTRegressor(featuresCol="features", labelCol="label", maxIter=25, seed=42)

    pipeline = Pipeline(stages=[assembler, gbt])

    print("Splitting data...")
    train_data, test_data = train_ready_df.randomSplit([0.8, 0.2], seed=42)

    print("Training GBT model (this may take a while)...")
    model = pipeline.fit(train_data)

    predictions = model.transform(test_data)
    evaluator = RegressionEvaluator(labelCol="label", predictionCol="prediction", metricName="rmse")
    rmse = evaluator.evaluate(predictions)

    print(f"Model Training Complete.")
    print(f"Root Mean Squared Error (RMSE) on test data: {rmse:.3f}")

    return model