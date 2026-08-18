import { api } from './client';
import type { LeaderboardEntry } from '../types';

export const leaderboardApi = {
  list: async () => {
    const { data } = await api.get<LeaderboardEntry[]>('/attempts/leaderboard');
    return data;
  },
};
