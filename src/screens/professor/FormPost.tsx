//PAGINA DE EDICAO FORMS PROFESSOR

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/services/api';

export function FormPost() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; titulo?: string; conteudo?: string; autor?: string }>();
  const editando = !!params.id;

  const [titulo, setTitulo] = useState(params.titulo ?? '');
  const [autor, setAutor] = useState(params.autor ?? '');
  const [conteudo, setConteudo] = useState(params.conteudo ?? '');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!titulo.trim() || !conteudo.trim()) {
      Alert.alert('Atenção', 'Preenche o título e o conteúdo.');
      return;
    }

    setSalvando(true);
    try {
      if (editando) {
        await api.put(`/posts/${params.id}`, { title: titulo, content: conteudo });
      } else {
        await api.post('/posts', { title: titulo, content: conteudo });
      }
      router.back();
    } catch (e: any) {
      console.log('ERRO AO SALVAR:', JSON.stringify(e?.toJSON?.() ?? e, null, 2));
      Alert.alert('Erro ao salvar', e?.response?.data?.message ?? 'Não foi possível salvar o post.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.titulo}>
          {editando ? 'Editar post' : 'Novo post'}
        </ThemedText>

        <ThemedText type="small">Título</ThemedText>
        <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} />

        <ThemedText type="small">Autor</ThemedText>
        <TextInput style={styles.input} value={autor} onChangeText={setAutor} editable={false} />

        <ThemedText type="small">Conteúdo</ThemedText>
        <TextInput
          style={[styles.input, styles.conteudo]}
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