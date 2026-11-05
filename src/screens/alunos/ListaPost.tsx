//PAGINA DO ALUNO - LISTA DE POST
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [logado, setLogado] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);

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

  // Relê o login toda vez que a tela aparece (ex.: ao voltar do login do aluno)
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.multiGet(['@token', '@nome']).then(([[, token], [, nome]]) => {
        setLogado(!!token);
        setNomeUsuario(nome);
      });
    }, [])
  );

  // Apaga o login guardado no aparelho e volta o botão para "Login"
  async function sair() {
    await AsyncStorage.multiRemove(['@token', '@nome']);
    setLogado(false);
    setNomeUsuario(null);
  }

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
            <TouchableOpacity style={styles.headerBotaoProfessor} onPress={sair}>
              <ThemedText type="smallBold" style={styles.headerBotaoProfessorTexto}>
                Sair
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
            style={styles.busca}
            placeholder="Buscar posts..."
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
});