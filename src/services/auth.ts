import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '@/services/api';
import { apiErrorMessage } from '@/services/api-error';
import type { UserRole } from '@/services/api';

export type AuthSession = {
  token: string;
  role: UserRole;
  userId: number | null;
};

export async function saveSession(
  token: string,
  role: UserRole,
  userId: number | null,
  name?: string
) {
  await AsyncStorage.multiSet([
    ['@token', token],
    ['@role', role],
    ['@userId', userId === null ? '' : String(userId)],
  ]);
  if (name) {
    await AsyncStorage.setItem('@nome', name);
  } else {
    await AsyncStorage.removeItem('@nome');
  }
}

export async function getStoredSession(): Promise<AuthSession | null> {
  const values = await AsyncStorage.multiGet(['@token', '@role', '@userId']);
  const token = values[0][1];
  const role = values[1][1];
  const storedUserId = values[2][1];

  if (!token || (role !== 'teacher' && role !== 'admin' && role !== 'student')) {
    return null;
  }

  const userId = storedUserId ? Number(storedUserId) : null;
  return {
    token,
    role,
    userId: userId !== null && Number.isFinite(userId) ? userId : null,
  };
}

export async function clearSession() {
  await AsyncStorage.multiRemove(['@token', '@role', '@userId', '@nome']);
}

export async function logoutSession() {
  try {
    await api.post('/auth/logout');
  } catch (error: unknown) {
    throw new Error(apiErrorMessage(error, 'Não foi possível encerrar a sessão.'));
  }

  await clearSession();
}
