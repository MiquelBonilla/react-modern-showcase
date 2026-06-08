import axios from 'axios';
import { env } from '@shared/config/env';
import { getToken } from './token';

export const api = axios.create({ baseURL: env.apiUrl });

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    return Promise.reject(
      axios.isAxiosError(error) ? error : new Error(String(error)),
    );
  },
);
