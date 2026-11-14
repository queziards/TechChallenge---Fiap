//PAGINA DE EDICAO FORMS PROFESSOR

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/ToastProvider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useRequireTeacher } from '@/hooks/use-require-teacher';
import api from '@/services/api';
import { apiErrorMessage } from '@/services/api-error';

export function FormPost() {
  const router = useRouter();
  const { showToast } = useToast();
  const theme = useTheme();
  const { checking, authorized } = useRequireTeacher();
  const params = useLocalSearchParams<{ id?: string; titulo?: string; conteudo?: string }>();
  const editando = !!params.id;

  const [titulo, setTitulo] = useState(params.titulo ?? '');
  const [conteudo, setConteudo] = useState(params.conteudo ?? '');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!authorized) return;
    if (!titulo.trim() || !conteudo.trim()) {
      Alert.alert('Atenção', 'Preenche o título e o conteúdo.');
      return;
    }

    setSalvando(true);
    try {
      if (editando) {
        await api.put(`/posts/${params.id}`, { title: titulo.trim(), content: conteudo.trim() });
      } else {
        await api.post('/posts', { title: titulo.trim(), content: conteudo.trim() });
      }
      if (editando) showToast('Post atualizado com sucesso.', 'success');
      router.back();
    } catch (e: unknown) {
      if (editando) {
        showToast(apiErrorMessage(e, 'Não foi possível atualizar o post.'), 'error');
      } else {
        Alert.alert('Erro ao salvar', apiErrorMessage(e, 'Não foi possível salvar o post.'));
      }
    } finally {
      setSalvando(false);
    }
  }

  if (checking || !authorized) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.titulo}>
          {editando ? 'Editar post' : 'Novo post'}
        </ThemedText>

        <ThemedText type="small">Título</ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
          placeholderTextColor={theme.textSecondary}
          value={titulo}
          onChangeText={setTitulo}
        />

        <ThemedText type="small">Conteúdo</ThemedText>
        <TextInput
          style={[styles.input, styles.conteudo, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
          placeholderTextColor={theme.textSecondary}
          value={conteudo}
          onChangeText={setConteudo}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.botao} onPress={salvar} disabled={salvando}>
          <ThemedText type="smallBold" style={styles.textoBotao}>
            {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar post'}
          </ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 16 },
  titulo: { marginBottom: 16 },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  conteudo: {
    height: 140,
    paddingTop: 10,
  },
  botao: {
    backgroundColor: '#E8174B',
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  textoBotao: { color: '#fff' },
});