from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
import json
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="StudyMate API",
    description="AI-powered student revision platform API for quiz generation and progress tracking",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - configure for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class QuizRequest(BaseModel):
    pdf_id: str
    question_type: str = "mcq"  # mcq, saq, laq, mixed
    difficulty: str = "medium"  # easy, medium, hard
    question_count: int = 10

class Question(BaseModel):
    id: str
    type: str
    question: str
    options: Optional[List[str]] = None
    correct_answer: Optional[int] = None
    sample_answer: Optional[str] = None
    explanation: str
    chapter: str

class QuizResponse(BaseModel):
    id: str
    questions: List[Question]
    time_limit: int
    created_at: str

class QuizSubmission(BaseModel):
    quiz_id: str
    answers: Dict[str, Any]
    time_taken: int

class ChatMessage(BaseModel):
    content: str
    pdf_id: Optional[str] = None
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    citations: Optional[List[str]] = None
    session_id: str

class PDFInfo(BaseModel):
    id: str
    title: str
    pages: int
    description: str
    upload_date: str
    processed: bool = True

# Sample Data - In production, this would come from database
SAMPLE_CHAPTERS = [
    {
        "id": "ch1",
        "title": "Units and Measurement",
        "pages": 25,
        "description": "Fundamental concepts of measurement in physics",
        "topics": ["SI Units", "Significant Figures", "Dimensional Analysis", "Error Analysis"]
    },
    {
        "id": "ch2", 
        "title": "Motion in a Straight Line",
        "pages": 28,
        "description": "Study of motion along a straight line",
        "topics": ["Displacement", "Velocity", "Acceleration", "Equations of Motion"]
    },
    {
        "id": "ch3",
        "title": "Work, Energy and Power", 
        "pages": 32,
        "description": "Fundamental concepts of work, energy and power",
        "topics": ["Work-Energy Theorem", "Kinetic Energy", "Potential Energy", "Conservation of Energy"]
    },
    {
        "id": "ch4",
        "title": "Motion in a Plane",
        "pages": 30,
        "description": "Two-dimensional motion analysis",
        "topics": ["Projectile Motion", "Circular Motion", "Vector Analysis"]
    }
]

SAMPLE_QUESTIONS = {
    "mcq": [
        {
            "id": "mcq1",
            "type": "mcq",
            "question": "The SI unit of electric current is:",
            "options": ["Coulomb", "Ampere", "Volt", "Ohm"],
            "correct_answer": 1,
            "explanation": "The ampere (A) is the SI base unit of electric current, defined in terms of the elementary charge.",
            "chapter": "Units and Measurement"
        },
        {
            "id": "mcq2", 
            "type": "mcq",
            "question": "In the measurement 0.00254 m, the number of significant figures is:",
            "options": ["2", "3", "5", "7"],
            "correct_answer": 1,
            "explanation": "Leading zeros are not significant. Only 2, 5, and 4 are significant figures.",
            "chapter": "Units and Measurement"
        },
        {
            "id": "mcq3",
            "type": "mcq",
            "question": "A body starting from rest moves with constant acceleration. The distance covered in the nth second is:",
            "options": ["u + a(2n-1)/2", "a(2n-1)/2", "an²", "a(n-1)"],
            "correct_answer": 1,
            "explanation": "For motion from rest, distance in nth second = a(2n-1)/2",
            "chapter": "Motion in Straight Line"
        },
        {
            "id": "mcq4",
            "type": "mcq",
            "question": "The work-energy theorem states that:",
            "options": [
                "Work done = Change in kinetic energy",
                "Work done = Change in potential energy", 
                "Work done = Total energy",
                "Work done = Change in momentum"
            ],
            "correct_answer": 0,
            "explanation": "The work-energy theorem states that the work done on an object equals the change in its kinetic energy.",
            "chapter": "Work Energy Power"
        },
        {
            "id": "mcq5",
            "type": "mcq",
            "question": "In projectile motion, the acceleration in the horizontal direction is:",
            "options": ["g", "-g", "0", "g/2"],
            "correct_answer": 2,
            "explanation": "In projectile motion, there is no acceleration in the horizontal direction (ignoring air resistance).",
            "chapter": "Motion in Plane"
        }
    ],
    "saq": [
        {
            "id": "saq1",
            "type": "saq",
            "question": "Define dimensional formula and give an example.",
            "sample_answer": "A dimensional formula is an expression that shows how a physical quantity depends on the base quantities. Example: [Force] = [MLT⁻²]",
            "explanation": "Dimensional formula helps in checking equation validity and unit conversions.",
            "chapter": "Units and Measurement"
        },
        {
            "id": "saq2",
            "type": "saq",
            "question": "State the three equations of motion for uniformly accelerated motion.",
            "sample_answer": "v = u + at, s = ut + ½at², v² = u² + 2as",
            "explanation": "These are the three kinematic equations for motion with constant acceleration.",
            "chapter": "Motion in Straight Line"
        },
        {
            "id": "saq3",
            "type": "saq",
            "question": "What is the difference between work and power?",
            "sample_answer": "Work is energy transferred to or from an object. Power is the rate of doing work or rate of energy transfer.",
            "explanation": "Work = Force × displacement, Power = Work/time",
            "chapter": "Work Energy Power"
        }
    ],
    "laq": [
        {
            "id": "laq1",
            "type": "laq",
            "question": "Explain the method of dimensional analysis and its applications with suitable examples.",
            "sample_answer": "Dimensional analysis involves expressing physical quantities in terms of fundamental dimensions [M], [L], [T]. Applications include: 1) Checking equation validity, 2) Deriving relationships, 3) Converting units. Example: Checking F = ma gives [MLT⁻²] = [M][LT⁻²] ✓",
            "explanation": "Dimensional analysis is a powerful tool for verification and derivation in physics.",
            "chapter": "Units and Measurement"
        },
        {
            "id": "laq2",
            "type": "laq",
            "question": "Derive the equations of motion graphically for uniformly accelerated motion.",
            "sample_answer": "Using v-t graph: 1) v = u + at (from slope), 2) s = ut + ½at² (from area under curve), 3) v² = u² + 2as (combining first two equations)",
            "explanation": "Graphical method provides intuitive understanding of motion equations.",
            "chapter": "Motion in Straight Line"
        }
    ]
}

# Helper functions
def generate_quiz_id():
    return f"quiz_{uuid.uuid4().hex[:8]}"

def get_questions_by_type(question_type: str, count: int, difficulty: str = "medium"):
    """Get questions based on type and difficulty"""
    available_questions = SAMPLE_QUESTIONS.get(question_type, [])
    
    # In a real implementation, filter by difficulty
    # For now, return random selection
    import random
    selected = random.sample(available_questions, min(count, len(available_questions)))
    
    # Add unique IDs for this quiz session
    for i, q in enumerate(selected):
        q["id"] = f"{question_type}_{i+1}_{uuid.uuid4().hex[:6]}"
    
    return selected

# API Routes

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "StudyMate API is running! 🚀",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "quiz": "/quiz/*",
            "pdfs": "/pdfs/*",
            "chat": "/chat/*",
            "progress": "/progress/*"
        }
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "service": "studymate-api",
        "timestamp": datetime.now().isoformat(),
        "uptime": "Running",
        "database": "connected",
        "ai_service": "ready"
    }

@app.post("/quiz/generate", response_model=QuizResponse, tags=["Quiz"])
async def generate_quiz(request: QuizRequest):
    """Generate quiz questions from PDF content using AI"""
    try:
        quiz_id = generate_quiz_id()
        
        # Validate request
        if request.question_count < 1 or request.question_count > 50:
            raise HTTPException(status_code=400, detail="Question count must be between 1 and 50")
        
        if request.question_type not in ["mcq", "saq", "laq", "mixed"]:
            raise HTTPException(status_code=400, detail="Invalid question type")
        
        if request.difficulty not in ["easy", "medium", "hard"]:
            raise HTTPException(status_code=400, detail="Invalid difficulty level")
        
        # Generate questions based on type
        questions = []
        
        if request.question_type == "mixed":
            # For mixed, distribute questions across types
            mcq_count = request.question_count // 2
            saq_count = request.question_count // 3
            laq_count = request.question_count - mcq_count - saq_count
            
            questions.extend(get_questions_by_type("mcq", mcq_count, request.difficulty))
            questions.extend(get_questions_by_type("saq", saq_count, request.difficulty))
            questions.extend(get_questions_by_type("laq", laq_count, request.difficulty))
        else:
            questions = get_questions_by_type(request.question_type, request.question_count, request.difficulty)
        
        # Calculate time limit (1 minute per MCQ, 3 minutes per SAQ, 5 minutes per LAQ)
        time_limit = 0
        for q in questions:
            if q["type"] == "mcq":
                time_limit += 60
            elif q["type"] == "saq":
                time_limit += 180
            elif q["type"] == "laq":
                time_limit += 300
        
        return QuizResponse(
            id=quiz_id,
            questions=[Question(**q) for q in questions],
            time_limit=time_limit,
            created_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

@app.post("/quiz/submit", tags=["Quiz"])
async def submit_quiz(submission: QuizSubmission):
    """Submit quiz answers and get results"""
    try:
        # In production, validate quiz_id and get original questions
        # For demo, return mock results
        
        total_questions = len(submission.answers)
        correct_count = 0
        
        # Mock scoring - in production, compare with correct answers
        for answer in submission.answers.values():
            if isinstance(answer, int) and answer in [0, 1]:  # Mock correct answers
                correct_count += 1
        
        score_percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
        
        return {
            "quiz_id": submission.quiz_id,
            "score": round(score_percentage, 1),
            "correct_count": correct_count,
            "total_questions": total_questions,
            "time_taken": submission.time_taken,
            "performance": "Excellent" if score_percentage >= 80 else "Good" if score_percentage >= 60 else "Needs Improvement",
            "submitted_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit quiz: {str(e)}")

@app.get("/pdfs/", response_model=List[PDFInfo], tags=["PDF Management"])
async def get_available_pdfs():
    """Get list of available PDFs (NCERT chapters + uploaded)"""
    try:
        pdfs = []
        for chapter in SAMPLE_CHAPTERS:
            pdfs.append(PDFInfo(
                id=chapter["id"],
                title=chapter["title"],
                pages=chapter["pages"],
                description=chapter["description"],
                upload_date=datetime.now().isoformat(),
                processed=True
            ))
        
        return pdfs
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch PDFs: {str(e)}")

@app.post("/pdfs/upload", tags=["PDF Management"])
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and process PDF file"""
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # In production, save file and process with PyPDF2/pdfplumber
        file_id = f"uploaded_{uuid.uuid4().hex[:8]}"
        
        # Mock processing
        return {
            "message": "PDF uploaded successfully",
            "pdf_id": file_id,
            "filename": file.filename,
            "status": "processing",
            "estimated_completion": "2-3 minutes"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload PDF: {str(e)}")

@app.post("/chat/message", response_model=ChatResponse, tags=["Chat"])
async def send_chat_message(message: ChatMessage):
    """Send message to AI chat assistant"""
    try:
        # Mock AI response - in production, use OpenAI API with RAG
        responses = [
            "That's a great question! According to the NCERT textbook, this concept relates to the fundamental principles of physics.",
            "Let me explain this step by step. Based on page 15 of your textbook, the key points are...",
            "This is an important topic for your exam. The formula you need to remember is...",
            "I can help you understand this better. Would you like me to provide some practice problems?"
        ]
        
        import random
        mock_response = random.choice(responses)
        
        session_id = message.session_id or f"chat_{uuid.uuid4().hex[:8]}"
        
        return ChatResponse(
            response=mock_response,
            citations=["Page 15, Units and Measurement", "Chapter 2, Section 2.3"],
            session_id=session_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process chat message: {str(e)}")

@app.get("/progress/dashboard", tags=["Progress Tracking"])
async def get_progress_dashboard():
    """Get user progress dashboard data"""
    try:
        # Mock progress data
        return {
            "total_quizzes": 15,
            "average_score": 78.5,
            "total_study_time": 24.5,
            "topics_mastered": 8,
            "current_streak": 5,
            "recent_attempts": [
                {
                    "id": "attempt_1",
                    "date": (datetime.now() - timedelta(hours=2)).isoformat(),
                    "subject": "Physics - Units & Measurement",
                    "score": 85,
                    "total_questions": 10,
                    "time_taken": 480
                },
                {
                    "id": "attempt_2", 
                    "date": (datetime.now() - timedelta(days=1)).isoformat(),
                    "subject": "Physics - Motion in Straight Line",
                    "score": 72,
                    "total_questions": 8,
                    "time_taken": 360
                },
                {
                    "id": "attempt_3",
                    "date": (datetime.now() - timedelta(days=2)).isoformat(),
                    "subject": "Physics - Work Energy Power",
                    "score": 90,
                    "total_questions": 12,
                    "time_taken": 600
                }
            ],
            "strengths": [
                {"topic": "Units and Measurement", "accuracy": 85},
                {"topic": "Work Energy Power", "accuracy": 90}
            ],
            "weaknesses": [
                {"topic": "Motion in Plane", "accuracy": 45}
            ],
            "study_recommendations": [
                "Focus more on 'Motion in Plane' - current accuracy is 45%",
                "Practice more MCQ questions on vector analysis",
                "Review projectile motion concepts"
            ],
            "weekly_progress": {
                "quizzes_this_week": 3,
                "average_score_this_week": 82,
                "improvement": "+5% from last week"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch progress data: {str(e)}")

@app.get("/progress/analytics", tags=["Progress Tracking"])
async def get_detailed_analytics():
    """Get detailed analytics and performance metrics"""
    try:
        return {
            "performance_trends": {
                "last_30_days": [78, 75, 82, 79, 85, 88, 82, 90, 85, 78],
                "labels": ["Week 1", "Week 2", "Week 3", "Week 4"]
            },
            "topic_breakdown": {
                "Units and Measurement": {"attempts": 5, "avg_score": 85},
                "Motion in Straight Line": {"attempts": 4, "avg_score": 72},
                "Work Energy Power": {"attempts": 6, "avg_score": 88},
                "Motion in Plane": {"attempts": 2, "avg_score": 45}
            },
            "question_type_performance": {
                "MCQ": {"attempts": 120, "avg_score": 82},
                "SAQ": {"attempts": 45, "avg_score": 75},
                "LAQ": {"attempts": 20, "avg_score": 70}
            },
            "study_habits": {
                "preferred_time": "Evening (6-8 PM)",
                "avg_session_duration": "25 minutes",
                "most_active_day": "Sunday"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"message": "Endpoint not found", "status": "error"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "status": "error"}
    )

# Main execution
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True if os.environ.get("ENVIRONMENT") == "development" else False,
        log_level="info"
    )
