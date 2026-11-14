//DETALHE DO POST PAGINA DO ALUNO

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { useToast } from '@/components/ToastProvider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import api from '@/services/api';
import { apiErrorMessage } from '@/services/api-error';
import type { UserRole } from '@/services/api';
import { getStoredSession } from '@/services/auth';

type Comentario = {
  id: number;
  content: string;
  userId?: number | string;
  user?: { id: number | string; name: string };
};

export function DetalhePost() {
  const theme = useTheme();
  const { showToast } = useToast();
  const { id, titulo, conteudo, autor, autorId } = useLocalSearchParams<{
    id: string;
    titulo: string;
    descricao: string;
    conteudo: string;
    autor: string;
    autorId?: string;
  }>();

  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [comentarioEditando, setComentarioEditando] = useState<number | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  // Lista os comentários do post: GET /api/v1/posts/:postId/comments
  const carregarComentarios = useCallback(async () => {
    try {
      const resposta = await api.get<Comentario[]>(`/posts/${id}/comments`);
      setComentarios(resposta.data);
    } catch (e: unknown) {
      Alert.alert('Erro', apiErrorMessage(e, 'Não foi possível carregar os comentários.'));
    }
  }, [id]);


  const router = useRouter();
  const [logado, setLogado] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);
  const postAutorId = autorId ? Number(autorId) : null;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getStoredSession()
        .then(async (session) => {
          if (!active) return;
          setLogado(!!session);
          setUsuarioId(session?.userId ?? null);
          setRole(session?.role ?? null);
          setNomeUsuario(session ? await AsyncStorage.getItem('@nome') : null);
        })
        .catch(() => {
          if (active) Alert.alert('Erro', 'Não foi possível verificar sua sessão.');
        });
      carregarComentarios();
      return () => {
        active = false;
      };
    }, [carregarComentarios])
  );

  async function salvarComentario() {
    if (!texto.trim()) return;
    const editando = comentarioEditando !== null;
    setEnviando(true);
    try {
      if (editando) {
        await api.put(`/comments/${comentarioEditando}`, { content: texto.trim() });
      } else {
        await api.post(`/posts/${id}/comments`, { content: texto.trim() });
      }
      setTexto('');
      setComentarioEditando(null);
      await carregarComentarios();
      if (editando) showToast('Comentário atualizado com sucesso.', 'success');
    } catch (e: unknown) {
      const mensagem = apiErrorMessage(
        e,
        editando ? 'Não foi possível editar o comentário.' : 'Não foi possível enviar o comentário.'
      );
      if (editando) showToast(mensagem, 'error');
      else Alert.alert('Erro', mensagem);
    } finally {
      setEnviando(false);
    }
  }

  function cancelarEdicao() {
    setComentarioEditando(null);
    setTexto('');
  }

  function excluirComentario(comentario: Comentario) {
    Alert.alert('Excluir comentário', 'Tem certeza que deseja excluir este comentário?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/comments/${comentario.id}`);
            setComentarios((atuais) => atuais.filter((item) => item.id !== comentario.id));
            showToast('Comentário excluído com sucesso.', 'success');
          } catch (e: unknown) {
            showToast(apiErrorMessage(e, 'Não foi possível excluir o comentário.'), 'error');
          }
        },
      },
    ]);
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

            {comentarioEditando !== null ? (
              <ThemedText type="small">Editando comentário</ThemedText>
            ) : null}
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
              placeholderTextColor={theme.textSecondary}
              placeholder={comentarioEditando === null ? 'Escreva um comentário' : 'Edite seu comentário'}
              value={texto}
              onChangeText={setTexto}
              multiline
            />
            <TouchableOpacity
              style={[styles.botao, enviando && styles.botaoDesabilitado]}
              onPress={salvarComentario}
              disabled={enviando}
            >
              <ThemedText style={styles.textoBotao}>
                {enviando
                  ? 'Salvando...'
                  : comentarioEditando === null
                    ? 'Comentar'
                    : 'Salvar alterações'}
              </ThemedText>
            </TouchableOpacity>
            {comentarioEditando !== null ? (
              <TouchableOpacity onPress={cancelarEdicao} disabled={enviando}>
                <ThemedText style={styles.cancelarEdicao}>Cancelar edição</ThemedText>
              </TouchableOpacity>
            ) : null}
          </>
        ) : (
          <TouchableOpacity
            style={styles.botao}
            onPress={() =>
              router.push({
                pathname: '/alunos/login-aluno',
                params: { id, titulo, conteudo, autor, autorId },
              })
            }
          >
            <ThemedText style={styles.textoBotao}>Entrar para comentar</ThemedText>
          </TouchableOpacity>
        )}

        {comentarios.length === 0 ? (
          <ThemedText style={styles.vazio}>Nenhum comentário ainda.</ThemedText>
        ) : (
          comentarios.map((c) => {
            const comentarioAutorId = Number(c.userId ?? c.user?.id);
            const meuComentario = usuarioId !== null && comentarioAutorId === usuarioId;
            const podeExcluir =
              meuComentario ||
              (role === 'teacher' && postAutorId === usuarioId && usuarioId !== null);

            return (
              <View key={c.id} style={styles.comentario}>
                {c.user?.name ? (
                  <ThemedText type="small" style={styles.autorComentario}>
                    {c.user.name}
                  </ThemedText>
                ) : null}
                <ThemedText>{c.content}</ThemedText>
                {logado && (meuComentario || podeExcluir) ? (
                  <View style={styles.acoesComentario}>
                    {meuComentario ? (
                      <TouchableOpacity
                        onPress={() => {
                          setComentarioEditando(c.id);
                          setTexto(c.content);
                        }}
                      >
                        <ThemedText style={styles.acaoComentario}>Editar</ThemedText>
                      </TouchableOpacity>
                    ) : null}
                    {podeExcluir ? (
                      <TouchableOpacity onPress={() => excluirComentario(c)}>
                        <ThemedText style={styles.acaoExcluirComentario}>Excluir</ThemedText>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          })
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
  cancelarEdicao: { color: '#E8174B', textAlign: 'center', marginBottom: 16 },
  acoesComentario: { flexDirection: 'row', gap: 16, marginTop: 10 },
  acaoComentario: { color: '#E8174B', fontWeight: '600' },
  acaoExcluirComentario: { color: '#999', fontWeight: '600' },
});