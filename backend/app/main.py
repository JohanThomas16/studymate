from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

app = FastAPI(title="StudyMate API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "StudyMate API is running! 🚀", "status": "healthy"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/pdfs/")
async def get_pdfs():
    return {
        "pdfs": [
            {"id": "ch1", "title": "Units and Measurement", "pages": 25},
            {"id": "ch2", "title": "Motion in Straight Line", "pages": 28},
            {"id": "ch3", "title": "Work Energy Power", "pages": 32}
        ]
    }

@app.post("/quiz/generate")
async def generate_quiz(request: dict):
    return {
        "id": "quiz_123",
        "questions": [
            {
                "id": "q1",
                "question": "What is the SI unit of electric current?",
                "options": ["Coulomb", "Ampere", "Volt", "Ohm"],
                "correct_answer": 1
            }
        ],
        "time_limit": 600
    }

@app.get("/progress/dashboard")
async def get_progress():
    return {
        "total_quizzes": 15,
        "average_score": 78.5,
        "recent_attempts": [
            {"subject": "Physics - Units", "score": 85, "date": "2 hours ago"}
        ]
    }
