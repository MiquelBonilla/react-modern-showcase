import { api } from '@shared/api';
import { dtoToUser, type User, type Credentials } from '../model/types';

export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get<unknown[]>('/users');
  return data.map((dto) => dtoToUser(dto as Parameters<typeof dtoToUser>[0]));
};

export const login = async (credentials: Credentials): Promise<User> => {
  const { data } = await api.get<unknown[]>('/users', { params: credentials });
  const users = data.map((dto) => dtoToUser(dto as Parameters<typeof dtoToUser>[0]));
  if (!users.length) {
    throw new Error('Invalid credentials');
  }
  return users[0];
};
