export type Difficulty = 'easy' | 'medium' | 'hard';

export interface User {
  id: number;
  userId?: number;
  name?: string;
  email: string;
  role?: 'user' | 'admin';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface SignupResponse {
  id: number;
  name: string;
  email: string;
}

export interface AnswerChoice {
  id: number;
  answerText: string;
}

export interface Question {
  id: number;
  questionText: string;
  difficulty: Difficulty;
  points: number;
  answers: AnswerChoice[];
}

export interface Quiz {
  id: number;
  title: string;
  description?: string | null;
  timeLimit?: number | null;
  category?: string | null;
  difficulty?: Difficulty | null;
  questions?: Question[];
}

export interface StartedAttempt {
  id: number;
  score: number;
  totalPoints: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  answeredQuestions: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  startedAt: string;
  completedAt: string | null;
}

export interface SubmitAnswer {
  questionId: number;
  answerId: number;
}

export interface SubmissionResult {
  attemptId: number;
  score: number;
  totalPoints: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  answeredQuestions: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  completedAt: string;
}

export interface AttemptHistoryItem {
  id: number;
  quiz: Quiz;
  score: number;
  totalPoints: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  answeredQuestions: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  startedAt: string;
  completedAt: string | null;
}

export interface AttemptReview extends AttemptHistoryItem {
  answers: Array<{
    id: number;
    questionId: number;
    questionText: string;
    selectedAnswer: { id: number | null; answerText: string };
    correctAnswer: AnswerChoice | null;
    isCorrect: boolean;
    pointsEarned: number;
    points: number;
    explanation?: string | null;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  bestScore: number;
  averageScore: number;
  highScores: number;
  testsTaken: number;
}
