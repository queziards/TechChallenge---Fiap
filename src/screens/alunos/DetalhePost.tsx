//DETALHE DO POST PAGINA DO ALUNO
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export function DetalhePost() {
  const { titulo, descricao, conteudo, autor } = useLocalSearchParams<{
    titulo: string;
    descricao: string;
    conteudo: string;
    autor: string;
  }>();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="small" style={styles.autor}>
          {autor}
        </ThemedText>
        <ThemedText type="title">{titulo}</ThemedText>
        <ThemedText style={styles.conteudo}>{conteudo}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1},
  content: { padding: 16, },
  autor: { color: '#E8174B', fontWeight: '600', marginBottom: 4,},
  conteudo: { marginTop: 12, lineHeight: 22},
  //titulo: { fontSize: 10 }
});