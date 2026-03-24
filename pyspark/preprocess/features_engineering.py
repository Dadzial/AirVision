from pyspark.sql import DataFrame, Window
from pyspark.sql.functions import col, avg, round, hour, dayofweek

def build_features(df: DataFrame) -> DataFrame:
    window_spec = Window.partitionBy("location_id").orderBy("timestamp")

    df = df.withColumn("pm25_rolling_avg_3h",round(avg(col("pm25")).over(window_spec.rowsBetween(-3, -1)), 3))
    df = df.withColumn("pm25_rolling_avg_24h",round(avg(col("pm25")).over(window_spec.rowsBetween(-24, -1)), 3))
    df = df.withColumn("hour", hour(col("timestamp")))
    df = df.withColumn("day_of_week", dayofweek(col("timestamp")))

    df = df.withColumn("pm25_diff", round(col("pm25") - col("prev_pm25"), 3))

    df = df.dropna(subset=["pm25_rolling_avg_3h", "pm25_rolling_avg_24h"])
    df = df.dropna(subset=["pm25_diff"])

    return df