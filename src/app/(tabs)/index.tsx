import { ListaPost } from '@/screens/alunos/ListaPost';
import { Stack } from 'expo-router';

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ title: 'Portal do Aluno' }} />
      <ListaPost />
    </>
  );
}