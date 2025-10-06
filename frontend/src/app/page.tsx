'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Brain, 
  BarChart3, 
  Upload, 
  Play, 
  Award, 
  MessageCircle,
  Settings,
  Clock,
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  FileText,
  Zap
} from 'lucide-react';

// Types
interface QuizAttempt {
  id: string;
  subject: string;
  score: number;
  date: string;
  totalQuestions: number;
}

interface Chapter {
  id: string;
  title: string;
  pages: number;
  description: string;
  progress: number;
}

export default function Home() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  // Sample data - in real app this would come from API
  const [stats, setStats] = useState({
    totalQuizzes: 15,
    averageScore: 78,
    studyHours: 24,
    topicsMastered: 8
  });

  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([
    { id: '1', subject: 'Physics - Units & Measurement', score: 85, date: '2 hours ago', totalQuestions: 10 },
    { id: '2', subject: 'Physics - Motion in Straight Line', score: 72, date: '1 day ago', totalQuestions: 8 },
    { id: '3', subject: 'Physics - Work Energy Power', score: 90, date: '2 days ago', totalQuestions: 12 },
  ]);

  const showLoading = (duration = 1000) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), duration);
  };

  useEffect(() => {
    // Show initial loading
    showLoading(800);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-xl">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span className="text-gray-900 font-medium">Loading StudyMate...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  StudyMate
                </h1>
                <p className="text-xs text-gray-500">AI Study Companion</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => {
                  showLoading(500);
                  setTimeout(() => setCurrentView('dashboard'), 500);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  showLoading(500);
                  setTimeout(() => setCurrentView('study'), 500);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'study' 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Brain className="w-4 h-4 inline mr-2" />
                Study
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' ? (
          <DashboardView stats={stats} recentAttempts={recentAttempts} />
        ) : (
          <StudyView onLoading={showLoading} />
        )}
      </main>
    </div>
  );
}

function DashboardView({ stats, recentAttempts }: { stats: any, recentAttempts: QuizAttempt[] }) {
  const statCards = [
    { 
      name: 'Quizzes Taken', 
      value: stats.totalQuizzes.toString(), 
      icon: Brain, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+3 this week'
    },
    { 
      name: 'Average Score', 
      value: `${stats.averageScore}%`, 
      icon: Award, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+5% from last week'
    },
    { 
      name: 'Study Hours', 
      value: stats.studyHours.toString(), 
      icon: Clock, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '4.2h this week'
    },
    { 
      name: 'Topics Mastered', 
      value: stats.topicsMastered.toString(), 
      icon: Target, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '2 new topics'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back! 👋
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track your progress and continue your learning journey with AI-powered study tools
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div 
            key={stat.name} 
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:scale-105"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-gray-600 font-medium mb-2">{stat.name}</p>
              <p className="text-sm text-green-600 font-medium">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Quiz Attempts</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {recentAttempts.length} attempts
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentAttempts.map((attempt, index) => (
                  <div 
                    key={attempt.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${attempt.score >= 80 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {attempt.score >= 80 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{attempt.subject}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{attempt.date}</span>
                          <span>•</span>
                          <span>{attempt.totalQuestions} questions</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${attempt.score >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {attempt.score}%
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Start New Quiz</span>
              </button>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="space-y-6">
          {/* Strengths & Weaknesses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Strong Topics</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="space-y-2">
                  {['Units & Measurement', 'Work Energy Power'].map((topic) => (
                    <div key={topic} className="bg-green-50 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Needs Focus</span>
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                </div>
                <div className="space-y-2">
                  {['Motion in Plane'].map((topic) => (
                    <div key={topic} className="bg-orange-50 text-orange-800 px-3 py-2 rounded-lg text-sm font-medium">
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Generate Practice Quiz</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Upload className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Upload New PDF</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors text-left">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Ask AI Tutor</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudyView({ onLoading }: { onLoading: (duration?: number) => void }) {
  const [selectedPDF, setSelectedPDF] = useState('ch1');
  const [currentMode, setCurrentMode] = useState('quiz');
  const [quizConfig, setQuizConfig] = useState({
    type: 'mcq',
    difficulty: 'medium', 
    questionCount: 10
  });

  const chapters: Chapter[] = [
    { 
      id: 'ch1', 
      title: 'Units and Measurement', 
      pages: 25, 
      description: 'Fundamental concepts of measurement in physics',
      progress: 85
    },
    { 
      id: 'ch2', 
      title: 'Motion in Straight Line', 
      pages: 28, 
      description: 'Study of motion along a straight line',
      progress: 60
    },
    { 
      id: 'ch3', 
      title: 'Work, Energy and Power', 
      pages: 32, 
      description: 'Fundamental concepts of work, energy and power',
      progress: 90
    },
    { 
      id: 'ch4', 
      title: 'Motion in a Plane', 
      pages: 30, 
      description: 'Two-dimensional motion analysis',
      progress: 30
    },
  ];

  const handleStartQuiz = () => {
    onLoading(2000);
    // In real app, this would generate quiz
    setTimeout(() => {
      alert(`Generated ${quizConfig.questionCount} ${quizConfig.type.toUpperCase()} questions at ${quizConfig.difficulty} difficulty!`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* PDF Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Select Study Material</h3>
            <p className="text-gray-600">Choose from NCERT Class XI Physics chapters</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Upload PDF</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => setSelectedPDF(chapter.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 ${
                selectedPDF === chapter.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <FileText className={`w-5 h-5 ${selectedPDF === chapter.id ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-xs text-gray-500">{chapter.pages} pages</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{chapter.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{chapter.description}</p>
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Progress</span>
                  <span className="text-gray-700 font-medium">{chapter.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${chapter.progress}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Study Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Viewer Mock */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {chapters.find(c => c.id === selectedPDF)?.title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Page 1 of {chapters.find(c => c.id === selectedPDF)?.pages}</span>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl h-96 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
              <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">PDF Viewer</h4>
              <p className="text-gray-500 text-center max-w-md">
                In the full implementation, this will show the actual PDF content with navigation controls, zoom, and text selection features.
              </p>
              <div className="mt-6 flex space-x-3">
                <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                  Previous Page
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                  Next Page
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz/Chat Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setCurrentMode('quiz')}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                currentMode === 'quiz'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Brain className="w-4 h-4 mr-2" />
              Quiz
            </button>
            <button
              onClick={() => setCurrentMode('chat')}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
                currentMode === 'chat'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </button>
          </div>

          <div className="flex-1 p-6">
            {currentMode === 'quiz' ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Generate AI Quiz</h4>
                  <p className="text-sm text-gray-600">Create personalized questions from your study material</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select 
                      value={quizConfig.type}
                      onChange={(e) => setQuizConfig({...quizConfig, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="mcq">Multiple Choice (MCQ)</option>
                      <option value="saq">Short Answer (SAQ)</option>
                      <option value="laq">Long Answer (LAQ)</option>
                      <option value="mixed">Mixed Questions</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select 
                      value={quizConfig.difficulty}
                      onChange={(e) => setQuizConfig({...quizConfig, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <input 
                      type="number" 
                      min="5" 
                      max="25" 
                      value={quizConfig.questionCount}
                      onChange={(e) => setQuizConfig({...quizConfig, questionCount: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={handleStartQuiz}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-4 h-full flex flex-col">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">AI Study Assistant</h4>
                  <p className="text-sm text-gray-600">Ask questions about your study material</p>
                </div>
                
                <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto min-h-[300px]">
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-sm text-gray-600">
                        👋 Hi! I'm your AI study assistant. I can help you understand concepts from your NCERT physics textbook. Try asking me:
                      </p>
                      <ul className="mt-2 text-sm text-gray-500 space-y-1">
                        <li>• "Explain the concept of significant figures"</li>
                        <li>• "What are the SI base units?"</li>
                        <li>• "Give me practice problems on dimensional analysis"</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Coming Soon:</strong> Full chat functionality with PDF context, citations, and personalized explanations!
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Ask a question about the content..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
