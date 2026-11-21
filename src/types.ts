export interface ResumeProject {
  name: string;
  techStack: string[];
  highlights: string;
}

export interface ResumeExperience {
  role: string;
  company: string;
  duration: string;
  impact: string;
}

export interface ResumeProfile {
  id: string;
  fileName: string;
  uploadedAt: string;
  candidateName: string;
  headline: string;
  yearsExperience: number;
  skills: string[];
  projects: ResumeProject[];
  experience: ResumeExperience[];
  tailoredAngles: string[];
  rawSummary: string;
}

export interface SkillScores {
  technicalDepth: number;
  resumeAlignment: number;
  systemArchitecture: number;
  communication: number;
  problemSolving: number;
}

export interface QuestionReview {
  question: string;
  candidateAnswer: string;
  rating: number;
  verdict: 'Strong' | 'Partial' | 'Needs Depth';
  feedback: string;
  idealAnswer: string;
}

export interface PastSession {
  id: string;
  date: string;
  company: string;
  role: string;
  score: number;
  crackProbability: string;
  overallSummary?: string;
  improvements?: string[];
  studyTopics?: string[];
  resumeUsed?: string;
  skillScores?: SkillScores;
}

export interface ScheduledSession {
  id: string;
  date: string;
  company: string;
  role: string;
  type: string;
}

export type ThemeVariant =
  | 'obsidian-violet'
  | 'amethyst'
  | 'orchid'
  | 'carbon-plum'
  | 'amoled'
  | 'cobalt'
  | 'cyan'
  | 'obsidian'
  | 'default'
  | 'midnight'
  | 'forest'
  | 'sunset';

export type ColorMode = 'dark' | 'light';

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
  scheduledSessions?: ScheduledSession[];
  loginStreak?: number;
  dailyGoal?: number;
  themePreference?: ThemeVariant;
  colorMode?: ColorMode;
  resumeProfile?: ResumeProfile | null;
  authProvider?: 'email' | 'google' | 'github' | 'guest';
  bookmarkedQuestionIds?: string[];
}

export type ExperienceTier =
  | 'Entry'
  | 'Mid-Level'
  | 'Senior'
  | 'Staff'
  | 'Principal';

export interface Question {
  id: string;
  text: string;
  company: string;
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Technical' | 'Behavioural' | 'System Design';
  level?: ExperienceTier;
  cultureFocus?: string;
  sampleAnswer?: string;
  tips?: string[];
  timesAsked?: number;
}

export interface ChatMessage {
  role: 'interviewer' | 'candidate';
  text: string;
}

export interface InterviewConfig {
  company: string;
  role: string;
  type: string;
  experience: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  resumeProfile?: ResumeProfile | null;
  startWithResume?: boolean;
  strictMode?: boolean;
  focusTopics?: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  company: string;
  role: string;
  type: string;
  difficulty: string;
  experience?: number;
  baseTier?: number;
  finalTier?: number;
  peakTier?: number;
  startTime: string;
  history: ChatMessage[];
  resumeProfile?: ResumeProfile | null;
  finalEvaluation?: {
    crackProbability: string;
    overallScore: number;
    overallSummary: string;
    speakingSkills: string;
    technicalSkills: string;
    deepDive: string;
    skillScores?: SkillScores;
    questionReviews?: QuestionReview[];
    improvements: string[];
    studyTopics?: string[];
  };
}

export type ViewState =
  | 'auth'
  | 'dashboard'
  | 'setup'
  | 'live'
  | 'results'
  | 'bank'
  | 'history'
  | 'simulation'
  | 'certificate'
  | 'suggestions'
  | 'learner'
  | 'security'
  | 'public-cert';
