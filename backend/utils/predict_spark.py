import subprocess
import json
import sys
import os
def call_spark_model(input_data, horizon):
    python_executable = sys.executable
    process = subprocess.Popen(
        [python_executable, "/home/damian/WebstormProjects/AirVision/pyspark/train/predict_spark.py", str(horizon)],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    input_json = json.dumps(input_data).encode()
    stdout, stderr = process.communicate(input=input_json)
    
    if process.returncode != 0:
        raise RuntimeError(f"Spark prediction failed for {horizon}h. Stderr: {stderr.decode()}")
    
    output = stdout.decode().strip()
    if not output:
        raise RuntimeError(f"Spark returned empty output for {horizon}h. Stderr: {stderr.decode()}")
        
    try:
        return float(output)
    except ValueError:
        raise RuntimeError(f"Cannot convert spark output to float: '{output}'. Stderr: {stderr.decode()}")
