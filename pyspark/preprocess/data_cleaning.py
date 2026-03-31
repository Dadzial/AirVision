from pyspark.sql.functions import lag,col, to_timestamp,year,month,dayofmonth
from pyspark.sql import DataFrame, Window

def clean_data(df:DataFrame) -> DataFrame:
    #Drop rows with missing values
    df = df.dropna(subset=[
        "pm25",
        "temperature",
        "humidity",
        "pressure",
        "wind_speed"
    ])

    #Fill missing station_name and city with "unknown"
    df = df.fillna({
        "station_name" :"unknown",
        "city" : "unknown"
    })

    #Convert from_datetime to timestamp
    df = df.withColumn(
        "timestamp",
        to_timestamp(col("from_datetime"))
    )

    #Filter out invalid values
    df = df.filter((col("pm25") >= 0) & (col("pm25") <= 1000))
    df = df.filter((col("humidity") >= 0) & (col("humidity") <= 100))
    df = df.filter(col("pressure") > 800)
    df = df.filter(col("wind_speed") >= 0)

    #Cast columns to correct types
    df = df.withColumn("pm25", col("pm25").cast("double")) \
        .withColumn("temperature", col("temperature").cast("double")) \
        .withColumn("humidity", col("humidity").cast("double")) \
        .withColumn("pressure", col("pressure").cast("double")) \
        .withColumn("wind_speed", col("wind_speed").cast("double")) \
        .withColumn("precipitation", col("precipitation").cast("double"))

    #Extract year, month, day from timestamp
    df = df.withColumn("year", year(col("timestamp"))) \
        .withColumn("month", month(col("timestamp"))) \
        .withColumn("day", dayofmonth(col("timestamp")))

    # Create lag feature for pm25
    window = Window.partitionBy("location_id").orderBy("timestamp")
    df=df.withColumn("prev_pm25", lag(col("pm25"), 1).over(window))

    # Drop first Record
    df = df.dropna(subset=["prev_pm25"])
    df = df.orderBy("location_id","timestamp")

    return df