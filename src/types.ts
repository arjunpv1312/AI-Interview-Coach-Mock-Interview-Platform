export interface PastSession {
  id: string;
  date: string;
  company: string;
  role: string;
  score: number;
  crackProbability: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  joinDate: string;
  totalInterviews: number;
  averageScore: number;
  scoreHistory?: number[];
  timeSpentSeconds?: number;
  companiesInterviewed?: string[];
  pastSessions?: PastSession[];
}

export interface Question {
  id: string;
  text: string;
  company: string;
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Technical' | 'Behavioural' | 'System Design';
  sampleAnswer?: string;
  tips?: string[];
  timesAsked?: number;
}

export interface ChatMessage {
  role: 'interviewer' | 'candidate';
  text: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  company: string;
  role: string;
  type: string;
  difficulty: string;
  startTime: string;
  history: ChatMessage[];
  finalEvaluation?: {
    crackProbability: string;
    overallSummary: string;
    speakingSkills: string;
    technicalSkills: string;
    deepDive: string;
    improvements: string[];
  };
}

export type ViewState = 'auth' | 'dashboard' | 'setup' | 'live' | 'results' | 'bank' | 'history';
