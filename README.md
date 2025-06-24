# Design Feedback App

A web application that utilizes AI to provide structured feedback on preschool play and toy designs. Upload playground and toy images, optionally add an activity description, and receive detailed evaluations across multiple play-based education criteria.
## Features
- Two-step image uploads: playground & toy
- Optional activity description with validation
- AI-generated feedback across defined criteria for each image
- Persistent storage in MongoDB
- Responsive multi-step UI built with Next.js & Tailwind CSS
- Dockerized setup for frontend, backend, and database
## Architecture
```text
Frontend (Next.js) <--> Backend (FastAPI + Uvicorn) <--> MongoDB
```
AI feedback via OpenAI Vision-capable models; static images served at `/images`.
## Tech Stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Pydantic, Uvicorn
- Database: MongoDB
- AI: OpenAI Vision models via `openai` Python SDK
- Containerization: Docker & Docker Compose
## Prerequisites
- Docker & Docker Compose (recommended)
- Node.js & npm (for frontend dev)
- Python 3.9+ & pip (for backend dev)
- MongoDB instance (local or Docker)
- OpenAI API key
## Getting Started
### Docker Compose (All-in-One)
```bash
export OPENAI_API_KEY="your_openai_api_key"
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend:  http://localhost:8000
### Local Development
#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
# Create .env with OPENAI_API_KEY & optional MONGO_URI
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
#### Frontend
```bash
cd frontend
npm install
# Add .env.local with NEXT_PUBLIC_BACKEND_URL
npm run dev
```
## API Endpoints
- GET  /                Welcome message
- POST /submit-design   Submit images & description, returns feedback
- GET  /feedback/{id}    Retrieve saved feedback
## Testing
Use `test_submit_design.py` at project root; update image paths & run:
```bash
python test_submit_design.py
```
## Project Structure
```
./
├─ backend/          FastAPI service & AI logic
├─ frontend/         Next.js UI
├─ docker-compose.yml  Docker orchestration
└─ test_submit_design.py  Example API client
```
## License
MIT (add LICENSE file)