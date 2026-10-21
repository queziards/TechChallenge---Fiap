import { FormAluno } from '@/screens/professor/FormAluno';
import { Stack } from 'expo-router';

export default function AlunoFormRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Aluno' }} />
      <FormAluno />
    </>
  );
}