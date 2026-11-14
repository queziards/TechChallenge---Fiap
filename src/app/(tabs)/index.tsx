import { ListaPost } from '@/screens/alunos/ListaPost';
import { Stack } from 'expo-router';

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ListaPost />
    </>
  );
}