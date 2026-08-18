import { api } from './client';
import type { Difficulty, Quiz } from '../types';

export interface AdminAnswerInput {
  answerText: string;
  isCorrect: boolean;
}

export interface AdminQuestionInput {
  questionText: string;
  difficulty: Difficulty;
  points: number;
  explanation?: string;
}

export interface AdminQuizInput {
  title: string;
  description?: string;
  category?: string;
  difficulty?: Difficulty;
  timeLimit?: number;
}

export const adminApi = {
  quizzes: async () => {
    const { data } = await api.get<Quiz[]>('/quizzes/admin/all');
    return data;
  },
  quiz: async (id: number) => {
    const { data } = await api.get<Quiz>(`/quizzes/admin/${id}`);
    return data;
  },
  createQuiz: async (body: AdminQuizInput) => {
    const { data } = await api.post<Quiz>('/quizzes', body);
    return data;
  },
  updateQuiz: async (id: number, body: Partial<AdminQuizInput>) => {
    const { data } = await api.patch<Quiz>(`/quizzes/${id}`, body);
    return data;
  },
  deleteQuiz: async (id: number) => {
    const { data } = await api.delete<{ deleted: boolean }>(`/quizzes/${id}`);
    return data;
  },
  createQuestion: async (quizId: number, body: AdminQuestionInput) => {
    const { data } = await api.post(`/quizzes/${quizId}/questions`, body);
    return data;
  },
  updateQuestion: async (questionId: number, body: Partial<AdminQuestionInput>) => {
    const { data } = await api.patch(`/quizzes/questions/${questionId}`, body);
    return data;
  },
  deleteQuestion: async (questionId: number) => {
    const { data } = await api.delete<{ deleted: boolean }>(`/quizzes/questions/${questionId}`);
    return data;
  },
  createAnswer: async (questionId: number, body: AdminAnswerInput) => {
    const { data } = await api.post(`/questions/${questionId}/answers`, body);
    return data;
  },
  updateAnswer: async (answerId: number, body: Partial<AdminAnswerInput>) => {
    const { data } = await api.patch(`/questions/answers/${answerId}`, body);
    return data;
  },
  deleteAnswer: async (answerId: number) => {
    const { data } = await api.delete<{ deleted: boolean }>(`/questions/answers/${answerId}`);
    return data;
  },
};
