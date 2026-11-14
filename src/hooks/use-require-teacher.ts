import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { getStoredSession } from '@/services/auth';
import type { UserRole } from '@/services/api';

export function useRequireTeacher() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setChecking(true);
      setAuthorized(false);

      getStoredSession()
        .then((session) => {
          if (!active) return;
          if (session?.role === 'teacher' || session?.role === 'admin') {
            setUserId(session.userId);
            setRole(session.role);
            setAuthorized(true);
            setChecking(false);
            return;
          }

          setChecking(false);
          router.replace(session?.role === 'student' ? '/' : '/professor/login');
        })
        .catch(() => {
          if (!active) return;
          setChecking(false);
          Alert.alert('Erro', 'Não foi possível verificar sua sessão.');
          router.replace('/professor/login');
        });

      return () => {
        active = false;
      };
    }, [router])
  );

  return { checking, authorized, userId, role };
}
