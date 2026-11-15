//PAGINA DO ALUNO - LISTA DE POST
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/PostCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import api, { PaginatedResponse, PaginationMeta, Post } from '@/services/api';
import { apiErrorMessage } from '@/services/api-error';
import { getStoredSession, logoutSession } from '@/services/auth';
import { getPaginatedList } from '@/utils/paginated-list';

const POR_PAGINA = 8;
const META_INICIAL: PaginationMeta = { currentPage: 1, lastPage: 1, total: 0, perPage: POR_PAGINA };

type PostApi = {
  id: number;
  title: string;
  content: string;
  userId?: number;
  user?: { id: number; name: string };
};

function mapPost(p: PostApi): Post {
  const resumo = p.content.length > 100 ? `${p.content.slice(0, 100)}...` : p.content;
  return {
    id: p.id,
    titulo: p.title,
    descricao: resumo,
    conteudo: p.content,
    autor: p.user?.name ?? 'Professor',
    autorId: p.userId ?? p.user?.id,
  };
}

export function ListaPost() {
  const router = useRouter();
  const theme = useTheme();
  const [busca, setBusca] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState(META_INICIAL);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [logado, setLogado] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);
  const [saindo, setSaindo] = useState(false);

  const buscarPosts = useCallback(async (termo: string, page: number) => {
    setCarregando(true);
    setErro('');
    try {
      const resposta = termo.trim()
      ? await api.get<PostApi[] | PaginatedResponse<PostApi>>('/posts/search', {
          params: { q: termo.trim(), page, perPage: POR_PAGINA },
        })
      : await api.get<PostApi[] | PaginatedResponse<PostApi>>('/posts', {
          params: { page, perPage: POR_PAGINA },
        });
    const resultado = getPaginatedList(resposta.data, page, POR_PAGINA);
    setPosts(resultado.data.map(mapPost));
    setMeta(resultado.meta);
    } catch (e: unknown) {
      setErro(apiErrorMessage(e, 'Não foi possível carregar os posts.'));
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getStoredSession()
        .then(async (session) => {
          if (!active) return;
          const studentSession = session?.role === 'student' ? session : null;
          setLogado(!!studentSession);
          const name = studentSession ? await AsyncStorage.getItem('@nome') : null;
          if (active) setNomeUsuario(name);
        })
        .catch(() => {
          if (active) setErro('Não foi possível verificar sua sessão.');
        });

      const timer = setTimeout(() => buscarPosts(busca, pagina), busca.trim() ? 350 : 0);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }, [busca, pagina, buscarPosts])
  );

  function alterarBusca(termo: string) {
    setBusca(termo);
    setPagina(1);
  }

  async function sair() {
    if (saindo) return;
    setSaindo(true);
    try {
      await logoutSession();
      setLogado(false);
      setNomeUsuario(null);
      router.replace('/professor/login');
    } catch (error: unknown) {
      setErro(apiErrorMessage(error, 'Não foi possível encerrar a sessão.'));
    } finally {
      setSaindo(false);
    }
  }

  function abrirPost(post: Post) {
    router.push({
      pathname: '/post/[id]',
      params: {
        id: String(post.id),
        titulo: post.titulo,
        descricao: post.descricao,
        conteudo: post.conteudo,
        autor: post.autor,
        autorId: post.autorId === undefined ? undefined : String(post.autorId),
      },
    });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerBarra}>
          <View>
            <ThemedText type="title" style={styles.headerTitulo}>
              Portal do Aluno
            </ThemedText>
            <ThemedText style={styles.headerSubtitulo}>
              {logado && nomeUsuario ? `Olá, ${nomeUsuario}` : 'Blog da turma'}
            </ThemedText>
          </View>

          {logado ? (
            <TouchableOpacity style={styles.headerBotaoProfessor} onPress={sair} disabled={saindo}>
              <ThemedText type="smallBold" style={styles.headerBotaoProfessorTexto}>
                {saindo ? 'Saindo...' : 'Sair'}
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <Link href="/professor/login" style={styles.headerBotaoProfessor}>
              <ThemedText type="smallBold" style={styles.headerBotaoProfessorTexto}>
                Login
              </ThemedText>
            </Link>
          )}
        </View>

        <View style={styles.conteudo}>
          <TextInput
            style={[styles.busca, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
            placeholderTextColor={theme.textSecondary}
            placeholder="Buscar posts..."
            value={busca}
            onChangeText={alterarBusca}
          />

          {carregando ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : erro ? (
            <ThemedText>{erro}</ThemedText>
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => <PostCard post={item} onPress={() => abrirPost(item)} />}
              ListEmptyComponent={<ThemedText>Nenhum post encontrado.</ThemedText>}
              onRefresh={() => buscarPosts(busca, pagina)}
              refreshing={carregando}
            />
          )}
          {!carregando && !erro ? (
            <View style={styles.paginacao}>
              <TouchableOpacity
                disabled={carregando || meta.currentPage <= 1}
                onPress={() => setPagina(meta.currentPage - 1)}
              >
                <ThemedText style={meta.currentPage <= 1 ? styles.paginaDesabilitada : styles.link}>
                  Anterior
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.textoPaginacao}>
                Página {meta.currentPage} de {meta.lastPage} · {meta.total === 0 ? 0 : (meta.currentPage - 1) * meta.perPage + 1}
                {'–'}{Math.min(meta.currentPage * meta.perPage, meta.total)} de {meta.total}
              </ThemedText>
              <TouchableOpacity
                disabled={carregando || meta.currentPage >= meta.lastPage}
                onPress={() => setPagina(meta.currentPage + 1)}
              >
                <ThemedText style={meta.currentPage >= meta.lastPage ? styles.paginaDesabilitada : styles.link}>
                  Próxima
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  headerBarra: {
    backgroundColor: '#E8174B',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitulo: { color: '#fff', fontSize: 26 },

  headerSubtitulo: {
    color: '#fff',
    opacity: 0.85,
    marginTop: 2,
    fontSize: 20,
  },

  headerBotaoProfessor: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 20,
  },

  headerBotaoProfessorTexto: {
    color: '#fff',
    fontSize: 18,
  },
  conteudo: { flex: 1, paddingHorizontal: 16, paddingTop: 14 },
  busca: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  paginacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  textoPaginacao: { fontSize: 13, textAlign: 'center' },
  link: { color: '#E8174B', fontWeight: '600' },
  paginaDesabilitada: { color: '#999' },
});