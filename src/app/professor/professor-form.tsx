import { FormProfessor } from '@/screens/professor/FormProfessor';
import { Stack } from 'expo-router';

export default function ProfessorFormRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Professor' }} />
      <FormProfessor />
    </>
  );
}