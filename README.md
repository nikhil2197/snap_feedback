# Play-based Classroom Feedback App

A web application that utilizes AI to provide structured feedback and improvement suggestions to preschool teachers on their classroom and activity setup.
Upload images of the classroom and activity with an optional activity description; the AI then produces detailed evaluations and high-context improvement suggestions synthesized from the uploaded images, the activity description, and the generated evaluation across multiple play-based education criteria.
  
This project was conceived and built end-to-end using AI assistance, based on the following workflow:
- Feature Definition (based on business needs and user feedback)
- PRD creation using ChatGPT
- Implementation in Cursor using the PRD

## Live Demo
  
Check out the working demo at: https://snap-feedback.vercel.app/ using the demo images and activity descriptions provided in the `Demo_Images` folder

## Video Walkthrough

A full video walkthrough is available in the `Video_Walkthrough.mp4` file in the repository root. This video demonstrates all key features—including image uploads, optional activity descriptions, AI-generated evaluations, and high-context improvement suggestions—in a single cohesive session.
To view the walkthrough, open the file with your preferred media player or click the link below:

[Full Video Walkthrough](Video_Walkthrough.mp4)

## Features
- Single-image upload for playground & toy via `/submit-design`, receive AI-generated evaluations and improvement suggestions
- Multiple-image upload support (1–3 playground and 1–3 toy images) via `/submit-design-multi`, receive AI-generated evaluations and improvement suggestions
- Optional activity description with validation (max 240 characters). The AI leverages this description along with the uploaded images and generated evaluation to produce high-context improvement suggestions.
- AI-generated evaluations across defined play-based criteria; improvement suggestions synthesized from images, optional activity description, and evaluation context
- Persistent storage in MongoDB
- Responsive multi-step UI built with Next.js & Tailwind CSS
- Containerized setup for development & production using Docker & Docker Compose
## Architecture
```text
Frontend (Next.js) <--> Backend (FastAPI + Uvicorn) <--> MongoDB
```
AI feedback via OpenAI Vision-capable models; static images served at `/images`.

## AI Workflow

Below are the processing pipelines for Playground and Toy feedback (left-to-right):

```text
### Playground: 
Image(s) + Activity Description --> Playground Analyzer (GPT-4.1-mini) --> Playground Eval --> Playground Suggestion Generator (GPT-4.1-mini; inputs: Image(s), Playground Eval, Activity Description) --> Playground Improvement Suggestion

### Toy:
Image(s) + Activity Description --> Toy Analyzer (GPT-4.1-mini) --> Toy Eval --> Toy Suggestion Generator (GPT-4.1-mini; inputs: Image(s), Toy Eval, Activity Description) --> Toy Improvement Suggestion
```

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
- POST /submit-design         Submit single playground & toy images (plus optional activity description); returns AI-generated evaluation and high-context improvement suggestions
- POST /submit-design-multi   Submit multiple playground & toy images (plus optional activity description); returns AI-generated evaluation and high-context improvement suggestions
- GET  /feedback/{submission_id} Retrieve saved AI-generated evaluation and high-context improvement suggestions
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
├── Video_Walkthrough.mp4    Full video walkthrough of the application
└── README.md
```
## License
MIT (add LICENSE file)
