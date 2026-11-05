//DETALHE DO POST PAGINA DO ALUNO

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/services/api';

type Comentario = {
  id: number;
  content: string;
  user?: { id: number; name: string };
};

export function DetalhePost() {
  const { id, titulo, conteudo, autor } = useLocalSearchParams<{
    id: string;
    titulo: string;
    descricao: string;
    conteudo: string;
    autor: string;
  }>();

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Lista os comentários do post: GET /api/v1/posts/:postId/comments
  const carregarComentarios = useCallback(async () => {
    try {
      const resposta = await api.get<Comentario[]>(`/posts/${id}/comments`);
      setComentarios(resposta.data);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os comentários.');
    }
  }, [id]);


const router = useRouter();
const [logado, setLogado] = useState(false);
const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);

//comentarios sao carregados
useFocusEffect(
  useCallback(() => {
    AsyncStorage.multiGet(['@token', '@nome']).then(([[, token], [, nome]]) => {
      setLogado(!!token);
      setNomeUsuario(nome);
    });
    carregarComentarios();
  }, [carregarComentarios])
);

  // Envia um comentário: POST /api/v1/posts/:postId/comments (exige login)
  async function comentar() {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      await api.post(`/posts/${id}/comments`, { content: texto.trim() });
      setTexto('');
      carregarComentarios();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível enviar o comentário. Verifique se você está logado.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText type="small" style={styles.autor}>
          {autor}
        </ThemedText>
        <ThemedText type="title">{titulo}</ThemedText>
        <ThemedText style={styles.conteudo}>{conteudo}</ThemedText>

        <ThemedText type="subtitle" style={styles.tituloComentarios}>
          Comentários
        </ThemedText>

        {logado ? (
          <>
            <View style={styles.linhaUsuario}>
              <ThemedText type="small">Comentando como {nomeUsuario ?? 'você'}</ThemedText>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Escreva um comentário"
              value={texto}
              onChangeText={setTexto}
              multiline
            />
            <TouchableOpacity
              style={[styles.botao, enviando && styles.botaoDesabilitado]}
              onPress={comentar}
              disabled={enviando}
            >
              <ThemedText style={styles.textoBotao}>{enviando ? 'Enviando...' : 'Comentar'}</ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.botao}
            onPress={() =>
              router.push({
                pathname: '/alunos/login-aluno',
                params: { id, titulo, conteudo, autor },
              })
            }
          >
            <ThemedText style={styles.textoBotao}>Entrar para comentar</ThemedText>
          </TouchableOpacity>
        )}

        {comentarios.length === 0 ? (
          <ThemedText style={styles.vazio}>Nenhum comentário ainda.</ThemedText>
        ) : (
          comentarios.map((c) => (
            <View key={c.id} style={styles.comentario}>
              {c.user?.name ? (
                <ThemedText type="small" style={styles.autorComentario}>
                  {c.user.name}
                </ThemedText>
              ) : null}
              <ThemedText>{c.content}</ThemedText>
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  autor: { color: '#E8174B', fontWeight: '600', marginBottom: 4 },
  conteudo: { marginTop: 12, lineHeight: 22 },
  tituloComentarios: { marginTop: 24, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    fontSize: 16,
    marginBottom: 10,
    
  },
  botao: {
    backgroundColor: '#E8174B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  botaoDesabilitado: { opacity: 0.6 },
  textoBotao: { color: '#fff', fontSize: 16 },
  vazio: { color: '#999' },
  comentario: {
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  autorComentario: { color: '#E8174B', fontWeight: '600', marginBottom: 2 },
  linhaUsuario: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
});