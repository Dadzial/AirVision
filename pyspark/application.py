import os
import json
import time
import shutil
import findspark
from pyspark.sql import SparkSession
from delta import configure_spark_with_delta_pip
from data.stream import OpenAQDataSource, fetch_locations_by_country
from preprocess.data_cleaning import clean_data
from preprocess.features_engineering import build_features
from train.train_model import train_gbt_model
from dotenv import load_dotenv

load_dotenv("../.env")
os.environ['JAVA_HOME'] = os.getenv("JAVA_HOME")
findspark.init(os.getenv("SPARK_HOME"))

BASE_DIR         = os.path.dirname(os.path.abspath(__file__))
CACHE_PATH       = os.path.join(BASE_DIR, "data", "locations_cache.json")
PARQUET_PATH     = os.path.join(BASE_DIR, "data", "parquet", "air_quality")
CHECKPOINT_PQ    = os.path.join(BASE_DIR, "data", "checkpoints", "parquet")
TRAINING_DIR     = os.path.join(BASE_DIR, "data", "training")
TRAINING_DELTA   = os.path.join(TRAINING_DIR, "air_quality_training_data")
TRAINING_CSV     = os.path.join(TRAINING_DIR, "air_quality_csv")

builder = (SparkSession.builder
           .master("local[1]")
           .appName("AirVision")
           .config("spark.sql.shuffle.partitions", "50")
           .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
           .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog"))

session = configure_spark_with_delta_pip(builder).getOrCreate()


def init_db(session: SparkSession) -> str:
    session.sql("DROP DATABASE IF EXISTS openaq CASCADE")
    session.sql("CREATE DATABASE IF NOT EXISTS openaq")
    session.sql("USE openaq")
    return session.catalog.currentDatabase()


def training_data_exists() -> bool:
    delta_log = os.path.join(TRAINING_DELTA, "_delta_log")
    if os.path.exists(delta_log):
        print(f"Training data already exists: {TRAINING_DELTA}")
        return True
    return False


def load_locations() -> list:
    if os.path.exists(CACHE_PATH):
        print("Loading stations from cache...")
        with open(CACHE_PATH, "r") as f:
            locations = json.load(f)
        print(f"Loaded {len(locations)} stations from cache")
        return locations

    print("Fetching stations from OpenAQ...")
    locations = fetch_locations_by_country()

    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    with open(CACHE_PATH, "w") as f:
        json.dump(locations, f)

    print(f"Saved {len(locations)} stations to cache")
    return locations


def collect_data(session: SparkSession, locations: list) -> None:
    print(f"Starting data collection for {len(locations)} stations...")

    df_stream = (session.readStream
                 .format("openaq")
                 .option("days_back", "365")
                 .option("locations_json", json.dumps(locations))
                 .load())

    parquet_query = (df_stream.writeStream
                     .format("parquet")
                     .option("path", PARQUET_PATH)
                     .option("checkpointLocation", CHECKPOINT_PQ)
                     .outputMode("append")
                     .trigger(processingTime="1 hour")
                     .start())

    print("Collection in progress — press Ctrl+C to stop and export...")

    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        print("Stopping collection...")

        parquet_query.stop()
        parquet_query.awaitTermination(60)

        print("Streams stopped — exporting training data...")
        export_training_data(session)


def export_training_data(session: SparkSession) -> None:
    print("Exporting training data...")

    session.catalog.clearCache()

    df = session.read.parquet(PARQUET_PATH)
    df = df.cache()
    df.count()

    print(f"Total rows:    {df.count()}")
    print(f"Stations:      {df.select('location_id').distinct().count()}")
    print(f"Countries:     {df.select('country').distinct().count()}")

    os.makedirs(TRAINING_DIR, exist_ok=True)

    df.write \
        .format("delta") \
        .mode("overwrite") \
        .save(TRAINING_DELTA)

    df.repartition(1) \
        .write \
        .mode("overwrite") \
        .option("header", "true") \
        .csv(TRAINING_CSV)

    files = os.listdir(TRAINING_CSV)
    csv_file = [f for f in files if f.startswith("part-") and f.endswith(".csv")][0]

    src = os.path.join(TRAINING_CSV, csv_file)
    dst = os.path.join(TRAINING_CSV, "air_quality.csv")

    shutil.move(src, dst)

    print(f"Saved Delta table: {TRAINING_DELTA}")
    print(f"Saved CSV:         {dst}")


current_db = init_db(session)
print(f"Current database: {current_db}")

session.dataSource.register(OpenAQDataSource)

if training_data_exists():
    print("Loading existing Delta table...")
    df = session.read.format("delta").load(TRAINING_DELTA)

    print(f"Rows:      {df.count()}")
    print(f"Stations:  {df.select('location_id').distinct().count()}")
    print(f"Countries: {df.select('country').distinct().count()}")
    df = clean_data(df)
    df = build_features(df)
    df.show(10)
    train_gbt_model(df)
else:
    locations = load_locations()
    collect_data(session, locations)
    df = session.read.format("delta").load(TRAINING_DELTA)


print("Stopping Spark session...")
session.stop()
print("Spark stopped")