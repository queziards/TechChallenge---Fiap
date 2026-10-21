import { Login } from '@/screens/professor/login';
import { Stack } from 'expo-router';

export default function LoginRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Login' }} />
      <Login />
    </>
  );
}