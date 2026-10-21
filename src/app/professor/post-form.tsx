import { FormPost } from '@/screens/professor/FormPost';
import { Stack } from 'expo-router';

export default function PostFormRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Post' }} />
      <FormPost />
    </>
  );
}