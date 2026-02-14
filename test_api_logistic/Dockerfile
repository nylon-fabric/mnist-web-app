FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --default-timeout=100 --retries=10 --no-cache-dir -r requirements.txt


COPY app/ ./app/

ENV FLASK_APP=app/app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=5001

EXPOSE 5001

CMD ["python", "app/app.py"]