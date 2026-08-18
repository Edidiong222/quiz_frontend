import { api } from './client';
import type { Quiz } from '../types';

export const quizzesApi = {
  list: async () => {
    const { data } = await api.get<Quiz[]>('/quizzes');
    return data;
  },
  detail: async (id: number) => {
    const { data } = await api.get<Quiz>(`/quizzes/${id}`);
    return data;
  },
};
