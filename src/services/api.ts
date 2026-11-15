import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.208:3333/api/v1',
});


api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export type Post = {
  id: number;
  titulo: string;
  descricao: string;
  conteudo: string;
  autor: string;
  autorId?: number;
};
export type Professor = { id: number; nome: string; email: string };
export type Aluno = { id: number; nome: string; email: string };

export type UserRole = 'teacher' | 'admin' | 'student';

export type PaginationMeta = {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};