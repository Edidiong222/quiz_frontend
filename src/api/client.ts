import axios, { AxiosError } from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || "https://quiz-backend-rab3.onrender.com/";
const TOKEN_KEY = 'quiz_access_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;
    const normalized = Array.isArray(backendMessage) ? backendMessage.join(' ') : backendMessage;
    const fallback =
      status === 400
        ? 'Please check your input and try again.'
        : status === 401
          ? 'Session expired. Please log in again.'
          : status === 403
            ? 'You do not have access to this action.'
            : status === 404
              ? 'The requested item was not found.'
              : status === 409
                ? 'This record already exists.'
                : status && status >= 500
                  ? 'Something went wrong on the server.'
                  : 'Unable to reach the server.';

    if (status === 401) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:expired'));
    }

    return Promise.reject(new ApiError(normalized || fallback, status));
  },
);
