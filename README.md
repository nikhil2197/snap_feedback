# Play-based Classroom Feedback App

A web application that utilizes AI to provide structured feedback to preschool teachers on their classroom and activity setup. Upload images of the classroom and activity, optionally add an activity description, and receive detailed evaluations across multiple play-based education criteria.
  
## Live Demo
  
Check out the working demo at: https://snap-feedback.vercel.app/ using the demo images and activity descriptions provided in the `Demo_Images` folder

## Features
- Single-image upload for playground & toy (via `/submit-design`)
- Multiple-image upload support (1–3 playground and 1–3 toy images) via `/submit-design-multi`
- Optional activity description with validation (max 240 characters)
- AI-generated feedback across defined play-based criteria
- Persistent storage in MongoDB
- Responsive multi-step UI built with Next.js & Tailwind CSS
- Containerized setup for development & production using Docker & Docker Compose
## Architecture
```text
Frontend (Next.js) <--> Backend (FastAPI + Uvicorn) <--> MongoDB
```
AI feedback via OpenAI Vision-capable models; static images served at `/images`.
## Tech Stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Pydantic, Uvicorn
- Database: MongoDB (local or MongoDB Atlas in production)
- AI: OpenAI Vision models via `openai` Python SDK
- Containerization: Docker & Docker Compose
- Deployment: Frontend on Vercel, Backend on Render, Database on MongoDB Atlas
## Prerequisites
- Docker & Docker Compose (recommended)
- Node.js & npm (for frontend dev)
- Python 3.9+ & pip (for backend dev)
- MongoDB instance (local, Docker, or MongoDB Atlas)
- OpenAI API key
## Getting Started
### Docker Compose (All-in-One)
```bash
export OPENAI_API_KEY="your_openai_api_key"
docker-compose -f docker-compose.yml up --build
```
- Frontend: http://localhost:3001
- Backend:  http://localhost:8001
  
### Development with Docker Compose (Live Reload)
```bash
export OPENAI_API_KEY="your_openai_api_key"
docker-compose -f docker-compose.dev.yml up --build
```
- Frontend: http://localhost:3001
- Backend:  http://localhost:8001
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
- Backend: http://localhost:8000
#### Frontend
#### Frontend
```bash
cd frontend
npm install
# Add .env.local with NEXT_PUBLIC_BACKEND_URL
npm run dev
```

## Deployment

- Frontend: Hosted on Vercel at https://snap-feedback.vercel.app
- Backend: Hosted on Render
- Database: Hosted on MongoDB Atlas (set `MONGO_URI` in environment variables)

## API Endpoints
- GET  /                      Welcome message
- POST /submit-design         Submit single playground & toy images
- POST /submit-design-multi   Submit multiple playground & toy images
- GET  /feedback/{submission_id} Retrieve saved feedback
## Testing
Use the following tests:
- **Single-image endpoint**:  
  ```bash
  python test_submit_design.py
  ```
- **Multi-image endpoint**:  
  ```bash
  python test_multi_images.py
  ```
- **Frontend manual test**:  
  Open `test_frontend.html` in your browser.
## Project Structure
```
.
├── backend/                 FastAPI service & AI logic
├── frontend/                Next.js UI
├── Demo_Images/             Example images and descriptions
├── docker-compose.yml       Production Docker Compose
├── docker-compose.dev.yml   Development Docker Compose
├── test_submit_design.py    Single-image API test
├── test_multi_images.py     Multi-image API test
├── test_frontend.html       Frontend manual test
└── README.md
```
## License
MIT (add LICENSE file)
