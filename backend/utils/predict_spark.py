import subprocess
import json

def call_spark_model(input_data):
    process = subprocess.Popen(
        ["python3", "/home/damian/WebstormProjects/AirVision/pyspark/train/predict_spark.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    input_json = json.dumps(input_data).encode()
    stdout, stderr = process.communicate(input=input_json)
    if process.returncode != 0:
        raise RuntimeError(f"Spark prediction failed: {stderr.decode()}")
    return float(stdout.decode())
