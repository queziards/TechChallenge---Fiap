import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://10.0.2.2:3333/api/v1', // api do emulador
  //'http://192.168.1.11:3333/api/v1' //api do mac na rede wifi
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
};
export type Professor = { id: number; nome: string; email: string };
export type Aluno = { id: number; nome: string; email: string };