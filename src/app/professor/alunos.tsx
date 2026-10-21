import { ListaAlunos } from '@/screens/professor/ListaAlunos';
import { Stack } from 'expo-router';

export default function AlunosRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Alunos' }} />
      <ListaAlunos />
    </>
  );
}