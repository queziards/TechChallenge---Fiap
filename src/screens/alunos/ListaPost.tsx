import { Link, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/PostCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api, { Post } from '@/services/api';


type PostApi = {
  id: number;
  title: string;
  content: string;
  userId: number;
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
  };
}

export function ListaPost() {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const buscarPosts = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const resposta = await api.get<PostApi[]>('/posts');
      setPosts(resposta.data.map(mapPost));
    } catch (e) {
      setErro('Não foi possível carregar os posts.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarPosts();
  }, [buscarPosts]);

  const postsFiltrados = posts.filter((post) =>
    (post.titulo + post.descricao).toLowerCase().includes(busca.toLowerCase())
  );

  function abrirPost(post: Post) {
    router.push({
      pathname: '/post/[id]',
      params: {
        id: String(post.id),
        titulo: post.titulo,
        descricao: post.descricao,
        conteudo: post.conteudo,
        autor: post.autor,
      },
    });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.titulo}>
          Portal do Aluno
        </ThemedText>
        <Link href="/professor/login" style={styles.linkProfessor}>
          <ThemedText style={styles.linkProfessor}>Sou Professor</ThemedText>
        </Link>
        <TextInput
          style={styles.busca}
          placeholder="Buscar posts"
          value={busca}
          onChangeText={setBusca}
        />

        {carregando ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : erro ? (
          <ThemedText>{erro}</ThemedText>
        ) : (
          <FlatList
            data={postsFiltrados}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <PostCard post={item} onPress={() => abrirPost(item)} />}
            ListEmptyComponent={<ThemedText>Nenhum post encontrado.</ThemedText>}
            onRefresh={buscarPosts}
            refreshing={carregando}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 16 },
  titulo: {
    marginBottom: 12,
    fontSize: 28,
  },
  busca: {
    height: 55,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  linkProfessor: {
    alignSelf: 'flex-start',
    marginTop: 16,
    marginBottom: 12,
    opacity: 0.9,
    fontSize: 18,
    //backgroundColor:'#e3e3e3',
 
  },
});