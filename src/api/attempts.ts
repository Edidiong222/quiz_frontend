import { api } from './client';
import type { AttemptHistoryItem, AttemptReview, StartedAttempt, SubmissionResult, SubmitAnswer } from '../types';

export const attemptsApi = {
  start: async (quizId: number) => {
    const { data } = await api.post<StartedAttempt>(`/attempts/quiz/${quizId}/start`);
    return data;
  },
  submit: async (attemptId: number, answers: SubmitAnswer[]) => {
    const { data } = await api.post<SubmissionResult>(`/attempts/${attemptId}/submit`, { answers });
    return data;
  },
  history: async () => {
    const { data } = await api.get<AttemptHistoryItem[]>('/attempts/history');
    return data;
  },
  result: async (attemptId: number) => {
    const { data } = await api.get<AttemptReview>(`/attempts/${attemptId}`);
    return data;
  },
};
