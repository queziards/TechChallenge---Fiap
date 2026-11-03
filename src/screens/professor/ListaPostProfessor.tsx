//LISTA DE POST DA PAGINA DO PROFESSOR - apos o login
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCardAdmin } from '@/components/PostCardAdmin';
import { ProfessorNav } from '@/components/ProfessorNav';
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

export function ListaPostProfessor() {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);

  const buscarPosts = useCallback(async () => {
    setCarregando(true);
    try {
      const resposta = await api.get<PostApi[]>('/posts/me');
      setPosts(resposta.data.map(mapPost));
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar seus posts.');
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
      params: { id: String(post.id), titulo: post.titulo, descricao: post.descricao, conteudo: post.conteudo, autor: post.autor },
    });
  }

  function editarPost(post: Post) {
    router.push({
      pathname: '/professor/post-form',
      params: { id: String(post.id), titulo: post.titulo, conteudo: post.conteudo, autor: post.autor },
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
            setPosts((atual) => atual.filter((p) => p.id !== post.id));
          } catch (e) {
            Alert.alert('Erro', 'Não foi possível excluir o post.');
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

        <TextInput style={styles.busca} placeholder="Buscar posts" value={busca} onChangeText={setBusca} />

        {carregando ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={postsFiltrados}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <PostCardAdmin post={item} onPress={() => abrirPost(item)} onEdit={() => editarPost(item)} onDelete={() => excluirPost(item)} />
            )}
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
    height: 40, 
    borderWidth: 1,
     borderColor: '#e3e3e3', 
     borderRadius: 8, 
     paddingHorizontal: 12, 
     marginBottom: 14,
     fontSize: 16,
     height: 55
     },
});