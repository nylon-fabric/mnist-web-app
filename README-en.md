# AI Handwritten Digit Recognition System (mnist-web-app)

![CI](https://github.com/nylon-fabric/mnist-web-app/actions/workflows/ci.yml/badge.svg)

![Frontend Demo](/docs/screen/mnist-web.gif)
## Overview
A web application that recognizes handwritten digits using a CNN model.<br>
Users can draw digits and get real-time predictions via an API.<br>
<br>
This is a full-stack AI web application built with React, Django, Flask, and TensorFlow.<br>
It is designed not only for digit prediction but also for multi-digit recognition and data accumulation for retraining through user corrections — aiming for practical, production-oriented functionality.<br>
<br>
This system is designed for practical usage, enabling continuous model improvement through user feedback.

## My Contributions
- Designed and implemented CNN model for digit recognition
- Built inference API using Flask
- Developed frontend using React and TypeScript
- Designed backend system using Django
- Implemented Human-in-the-Loop retraining pipeline
- Containerized services using Docker

## Results
- Achieved ~98% accuracy on MNIST test dataset
- Supports multi-digit recognition
- Implemented Human-in-the-Loop retraining pipeline
- Designed a decoupled architecture (React, Django, Flask)

## Features
- Multi-digit recognition<br>
   Batch processes images containing multiple digits and predicts them at once.
- Human-in-the-Loop<br>
   Users can correct AI mispredictions, and the corrected labels are stored in the database for future retraining.
- Decoupled architecture<br>
   Web management (Django) and AI inference (Flask) are separated, making the system robust to model updates.

## Tech Stack
### Frontend
- React / TypeScript / Vite<br>
  Type-safe development and an intuitive UI using Canvas.
### Backend
- Django<br>
  Backend framework for web management and data handling.
- Flask<br>
  Lightweight API server dedicated to AI inference.
### AI / Machine Learning
- TensorFlow / Keras<br>
  Custom CNN (Convolutional Neural Network) model for digit recognition.
### Infrastructure
- Docker / Docker Compose<br> 
  Containerized environment for consistent development.
- SQLite<br>
  Lightweight database optimized for development efficiency.

## System Architecture
![Architecture Diagram](/docs/architecture/architecture.png)

## AI Model Details
Custom CNN model implementation:
- Dataset: MNIST (60,000 train / 10,000 test)
- Input: $28 \times 28$ grayscale images
- Architecture<br>
  2 convolution layers (32, 64 filters),<br>
  2 pooling layers, dropout (0.5)
- Design philosophy<br>
  Gradually reduces resolution while increasing feature richness, improving robustness to noise.

## Model Layer Diagram
![Model Layer Diagram](/docs/architecture/ml_model_architecture/ml_model_architecture.svg)

## Highlights & Solutions
1. AIModelConfig-based model control<br>
  Model switching is managed via the database, enabling updates without code changes through the admin interface.
2. Retraining data pipeline<br>
  User-corrected labels are stored in the RetrainingData table for future model improvement.
3. Microservice architecture with Docker<br>
  Web and AI services are separated into containers, allowing independent scaling of the inference engine.

## Directory Structure
- frontend/ # React
- backend/  # Django
- ml_api/   # Flask + Model

## How to Run
The system consists of:
- AAI inference API (Flask): Docker container
- Web management server (Django): local execution
- Frontend (React): local execution

### 1. Start AI Inference API (Docker)
```bash
cd ml_api
docker-compose up --build
```
### 2. Start Django Server
```bash
cd backend
venv\Scripts\activate # Windows
python manage.py migrate
python manage.py loaddata initial_data.json
python manage.py runserver
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
### Backend–Container Connections
Model switching is controlled via URLs registered in the AIModelConfig table.<br>
Current configurations:
- MNIST CNN v1 http://localhost:5000
- MNIST Logistic http://localhost:5001

### AIModelConfig Design Details
- ["Class diagram"](/docs/classDiagram/classDiagram.md)
