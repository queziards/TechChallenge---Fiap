import { ListaPostProfessor } from '@/screens/professor/ListaPostProfessor';
import { Stack } from 'expo-router';

export default function ProfessorIndexRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Portal do Professor' }} />
      <ListaPostProfessor />
    </>
  );
}