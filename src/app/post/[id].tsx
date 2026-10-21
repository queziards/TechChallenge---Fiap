import { DetalhePost } from '@/screens/alunos/DetalhePost';
import { Stack } from 'expo-router';

export default function PostRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Post' }} />
      <DetalhePost />
    </>
  );
}