from pyspark.sql import DataFrame, Window
from pyspark.sql.functions import col, avg, round, hour, dayofweek, lag

# Build features for model
def build_features(df: DataFrame) -> DataFrame:
    # Window specification for stations
    window_spec = Window.partitionBy("location_id").orderBy("timestamp")

    # Rolling averages for pm25 from 3h
    df = df.withColumn("pm25_rolling_avg_3h", round(avg(col("pm25")).over(window_spec.rowsBetween(-3, -1)), 3))
    # Rolling averages for pm25 from 24h
    df = df.withColumn("pm25_rolling_avg_24h", round(avg(col("pm25")).over(window_spec.rowsBetween(-24, -1)), 3))

    # LAG FEATURES
    df = df.withColumn("pm25_lag_1h", lag(col("pm25"), 1).over(window_spec))
    df = df.withColumn("pm25_lag_12h", lag(col("pm25"), 12).over(window_spec))
    df = df.withColumn("pm25_lag_24h", lag(col("pm25"), 24).over(window_spec))
    df = df.withColumn("temp_lag_6h", lag(col("temperature"), 6).over(window_spec))
    df = df.withColumn("humidity_lag_6h", lag(col("humidity"), 6).over(window_spec))

    # Day of week and time of day
    df = df.withColumn("hour", hour(col("timestamp")))
    df = df.withColumn("day_of_week", dayofweek(col("timestamp")))

    # Change of pm25 to previous hour
    df = df.withColumn("pm25_diff", round(col("pm25") - col("prev_pm25"), 3))

    # First rows is deleted
    df = df.dropna(subset=["pm25_rolling_avg_3h", "pm25_rolling_avg_24h", "pm25_lag_24h"])
    df = df.dropna(subset=["pm25_diff"])

    return df
