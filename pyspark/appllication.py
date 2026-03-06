import os
import time
import findspark
import stream
import pyspark.sql.functions as F
from pyspark.sql import SparkSession
from pyspark.sql.types import *
from pyspark.sql.streaming import DataStreamReader, StreamingQuery
from delta import *
from datetime import timedelta, datetime
import dbutils
from pyspark.sql.functions import *
from time import sleep
from random import random, randint, choice
from displayfunction import display
from dotenv import load_dotenv

load_dotenv("../.env")
os.environ['JAVA_HOME'] = os.getenv("JAVA_HOME")
findspark.init(os.getenv("SPARK_HOME"))

session = SparkSession.builder \
    .master("local[*]") \
    .appName("AirVision") \
    .config("spark.sql.shuffle.partitions", "50") \
    .getOrCreate()

time.sleep(60)

print("Stopping Spark session...")
session.stop()
print("Spark stopped")