//LISTA DE POST DA PAGINA DO PROFESSOR - apos o login
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCardAdmin } from '@/components/PostCardAdmin';
import { ProfessorNav } from '@/components/ProfessorNav';
import { useToast } from '@/components/ToastProvider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useRequireTeacher } from '@/hooks/use-require-teacher';
import api, { PaginatedResponse, PaginationMeta, Post } from '@/services/api';
import { apiErrorMessage } from '@/services/api-error';
import { getPaginatedList } from '@/utils/paginated-list';
import { canManagePost } from '@/utils/post-permissions';

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

export function ListaPostProfessor() {
  const router = useRouter();
  const { showToast } = useToast();
  const theme = useTheme();
  const { checking, authorized, userId, role } = useRequireTeacher();
  const [busca, setBusca] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState(META_INICIAL);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);

  const buscarPosts = useCallback(async (termo: string, page: number) => {
    if (!authorized) return;
    setCarregando(true);
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
      Alert.alert('Erro', apiErrorMessage(e, 'Não foi possível carregar os posts.'));
    } finally {
      setCarregando(false);
    }
  }, [authorized]);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => buscarPosts(busca, pagina), busca.trim() ? 400 : 0);
      return () => clearTimeout(timer);
    }, [busca, pagina, buscarPosts])
  );

  function alterarBusca(termo: string) {
    setBusca(termo);
    setPagina(1);
  }

  if (checking || !authorized) return <ActivityIndicator style={{ flex: 1 }} />;

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

  function editarPost(post: Post) {
    router.push({
      pathname: '/professor/post-form',
      params: { id: String(post.id), titulo: post.titulo, conteudo: post.conteudo },
    });
  }

  function excluirPost(post: Post) {
    Alert.alert('Excluir post', `Tem certeza que deseja excluir "${post.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/posts/${post.id}`);
            showToast('Post excluído com sucesso.', 'success');
            if (posts.length === 1 && meta.currentPage > 1) {
              setPagina(meta.currentPage - 1);
            } else {
              await buscarPosts(busca, meta.currentPage);
            }
          } catch (e: unknown) {
            showToast(apiErrorMessage(e, 'Não foi possível excluir o post.'), 'error');
          }
        },
      },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ProfessorNav />
        <View style={styles.cabecalho}>
          <ThemedText type="title">Posts</ThemedText>
          <TouchableOpacity style={styles.botaoNovo} onPress={() => router.push('/professor/post-form')}>
            <ThemedText  style={styles.textoBotaoNovo}>+ Novo</ThemedText>
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.busca, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
          placeholderTextColor={theme.textSecondary}
          placeholder="Buscar posts"
          value={busca}
          onChangeText={alterarBusca}
        />

        {carregando ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <PostCardAdmin
                post={item}
                canManage={canManagePost(role, item.autorId, userId)}
                onPress={() => abrirPost(item)}
                onEdit={() => editarPost(item)}
                onDelete={() => excluirPost(item)}
              />
            )}
            ListEmptyComponent={<ThemedText>Nenhum post encontrado.</ThemedText>}
            onRefresh={() => buscarPosts(busca, pagina)}
            refreshing={carregando}
          />
        )}
        {!carregando ? (
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
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1
   },
  safeArea: { 
    flex: 1, 
    paddingHorizontal: 16 
  },
  cabecalho: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12 
  },
  botaoNovo: { 
    backgroundColor: '#E8174B', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  textoBotaoNovo: { 
    color: '#fff', 
    fontSize: 18,
    height: 26
  },
  busca: { 
    borderWidth: 1,
     borderColor: '#e3e3e3', 
     borderRadius: 8, 
     paddingHorizontal: 12, 
     marginBottom: 14,
     fontSize: 16,
     height: 55
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