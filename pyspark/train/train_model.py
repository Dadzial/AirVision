import os

from pyspark.ml.feature import VectorAssembler
from pyspark.ml.regression import GBTRegressor
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.ml import Pipeline
from pyspark.sql import DataFrame, Window
from pyspark.sql.functions import col, lead

def train_gbt_model(train_data: DataFrame, test_data: DataFrame):
    print("Preparing data for training (1h forecast)...")

    window_spec = Window.partitionBy("location_id").orderBy("timestamp")

    train_data = train_data.withColumn("label", lead(col("pm25"), 1).over(window_spec))
    test_data  = test_data.withColumn("label",  lead(col("pm25"), 1).over(window_spec))

    train_data = train_data.dropna(subset=["label"])
    test_data  = test_data.dropna(subset=["label"])

    print("Caching prepared datasets to RAM...")
    try:
        train_data = train_data.cache()
        test_data = test_data.cache()

        train_count = train_data.count()
        test_count = test_data.count()
        print(f"Train size: {train_count} | Test size: {test_count}")
    except Exception as e:
        print(f"Error during caching: {e}")
        raise

    feature_cols = [
        "pm25", "temperature", "humidity", "pressure", "wind_speed",
        "pm25_rolling_avg_3h", "pm25_rolling_avg_24h",
        "pm25_lag_1h", "pm25_lag_12h",
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

    print("Training model...")
    best_model = pipeline.fit(train_data)
    train_data.unpersist()

    predictions = best_model.transform(test_data)

    metrics = ["rmse", "mae", "r2"]
    results = {}
    for metric in metrics:
        ev = RegressionEvaluator(labelCol="label", predictionCol="prediction", metricName=metric)
        results[metric] = ev.evaluate(predictions)

    print("\nResults on test set (+1 hour)")
    print(f"RMSE: {results['rmse']:.3f}")
    print(f"MAE:  {results['mae']:.3f}")
    print(f"R2:   {results['r2']:.3f}")

    gbt_stage = best_model.stages[-1]
    print("\nHyperparameters")
    print(f"maxIter:  {gbt_stage.getMaxIter()}")
    print(f"maxDepth: {gbt_stage.getMaxDepth()}")
    print(f"stepSize: {gbt_stage.getStepSize()}")

    importances = gbt_stage.featureImportances
    print("\nFeature importances")
    for name, imp in sorted(zip(feature_cols, importances), key=lambda x: -x[1]):
        bar = "█" * int(imp * 40)
        print(f"{name:30} {imp:.4f}  {bar}")

    current_dir=os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(current_dir, "models", "air_quality_forecasting")
    best_model.write().overwrite().save(model_dir)

    test_data.unpersist()
    return best_model
