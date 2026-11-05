import { LoginAluno } from '@/screens/alunos/LoginAluno';
import { Stack } from 'expo-router';

export default function LoginAlunoRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Entrar' }} />
      <LoginAluno />
    </>
  );
}