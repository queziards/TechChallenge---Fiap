import { ListaProfessores } from '@/screens/professor/ListaProfessores';
import { Stack } from 'expo-router';

export default function ProfessoresRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Professores' }} />
      <ListaProfessores />
    </>
  );
}