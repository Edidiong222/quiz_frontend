import { api } from './client';
import type { AuthResponse, SignupResponse, User } from '../types';

export const authApi = {
  signup: async (body: { name: string; email: string; password: string }) => {
    const { data } = await api.post<SignupResponse>('/auth/signup', body);
    return data;
  },
  login: async (body: { email: string; password: string }) => {
    const { data } = await api.post<AuthResponse>('/auth/login', body);
    return data;
  },
  me: async () => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },
};
