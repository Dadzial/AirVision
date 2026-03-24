import pandas
import pyspark
import numpy
import os
from pyspark.sql import SparkSession
from pyspark.sql.functions import lag,col, to_timestamp,year,month,dayofmonth
from delta import configure_spark_with_delta_pip
from pyspark.sql import DataFrame, Window



def clean_data(df:DataFrame) -> DataFrame:

    df = df.dropna(subset=[
        "pm25",
        "temperature",
        "humidity",
        "pressure",
        "wind_speed"
    ])

    df = df.fillna({
        "station_name" :"unknown",
        "city" : "unknown"
    })

    df = df.withColumn(
        "timestamp",
        to_timestamp(col("from_datetime"))
    )

    df = df.filter((col("pm25") >= 0) & (col("pm25") <= 1000))
    df = df.filter((col("humidity") >= 0) & (col("humidity") <= 100))
    df = df.filter(col("pressure") > 800)
    df = df.filter(col("wind_speed") >= 0)

    df = df.withColumn("pm25", col("pm25").cast("double")) \
        .withColumn("temperature", col("temperature").cast("double")) \
        .withColumn("humidity", col("humidity").cast("double")) \
        .withColumn("pressure", col("pressure").cast("double")) \
        .withColumn("wind_speed", col("wind_speed").cast("double")) \
        .withColumn("precipitation", col("precipitation").cast("double"))

    df = df.withColumn("year", year(col("timestamp"))) \
        .withColumn("month", month(col("timestamp"))) \
        .withColumn("day", dayofmonth(col("timestamp")))

    window = Window.partitionBy("location_id").orderBy("timestamp")
    df=df.withColumn("prev_pm25", lag(col("pm25"), 1).over(window))

    df = df.dropna(subset=["prev_pm25"])
    df = df.orderBy("location_id","timestamp")

    return df