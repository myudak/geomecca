FROM python:3.11-slim
WORKDIR /app
COPY scripts/seedlink_mock.py scripts/simulation_utils.py /app/
RUN pip install --no-cache-dir obspy
EXPOSE 18000
CMD ["python", "/app/seedlink_mock.py", "--host", "0.0.0.0", "--port", "18000", "--loop", "--realtime", "--use-default-stations"]
