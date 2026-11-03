//LISTA DE ALUNOS CADASTRADOS
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfessorNav } from '@/components/ProfessorNav';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api, { Aluno } from '@/services/api';

const POR_PAGINA = 3;

type UserApi = { id: number; name: string; email: string };

function mapAluno(u: UserApi): Aluno {
  return { id: u.id, nome: u.name, email: u.email };
}

export function ListaAlunos() {
  const router = useRouter();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(1);

  const buscarAlunos = useCallback(async () => {
    setCarregando(true);
    try {
      const resposta = await api.get<UserApi[]>('/students');
      setAlunos(resposta.data.map(mapAluno));
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os alunos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarAlunos();
  }, [buscarAlunos]);

  const totalPaginas = Math.max(1, Math.ceil(alunos.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const itensDaPagina = alunos.slice(inicio, inicio + POR_PAGINA);

  function editar(aluno: Aluno) {
    router.push({
      pathname: '/professor/aluno-form',
      params: { id: String(aluno.id), nome: aluno.nome, email: aluno.email },
    });
  }

  function excluir(aluno: Aluno) {
    Alert.alert('Excluir aluno', `Tem certeza que deseja excluir "${aluno.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/students/${aluno.id}`);
            setAlunos((atual) => atual.filter((a) => a.id !== aluno.id));
          } catch (e) {
            Alert.alert('Erro', 'Não foi possível excluir o aluno.');
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
          <ThemedText type="title">Alunos</ThemedText>
          <TouchableOpacity style={styles.botaoNovo} onPress={() => router.push('/professor/aluno-form')}>
            <ThemedText type="smallBold" style={styles.textoBotaoNovo}>+ Novo</ThemedText>
          </TouchableOpacity>
        </View>

        {carregando ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <>
            <FlatList
              data={itensDaPagina}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View>
                    <ThemedText type="smallBold">{item.nome}</ThemedText>
                    <ThemedText type="small">{item.email}</ThemedText>
                  </View>
                  <View style={styles.acoes}>
                    <TouchableOpacity onPress={() => editar(item)}>
                      <ThemedText  style={styles.link}>Editar</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => excluir(item)}>
                      <ThemedText  style={styles.linkExcluir}>Excluir</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={<ThemedText>Nenhum aluno cadastrado.</ThemedText>}
              onRefresh={buscarAlunos}
              refreshing={carregando}
            />

            <View style={styles.paginacao}>
              <TouchableOpacity disabled={pagina === 1} onPress={() => setPagina((p) => p - 1)}>
                <ThemedText type="small" style={pagina === 1 ? styles.paginaDesabilitada : styles.link}>Anterior</ThemedText>
              </TouchableOpacity>
              <ThemedText type="small">Página {pagina} de {totalPaginas}</ThemedText>
              <TouchableOpacity disabled={pagina === totalPaginas} onPress={() => setPagina((p) => p + 1)}>
                <ThemedText type="small" style={pagina === totalPaginas ? styles.paginaDesabilitada : styles.link}>Próxima</ThemedText>
              </TouchableOpacity>
            </View>
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 16 },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  botaoNovo: { backgroundColor: '#E8174B', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  textoBotaoNovo: { color: '#fff',  fontSize: 18 },
  card: {
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acoes: { flexDirection: 'row', gap: 16 },
  link: { color: '#E8174B', fontWeight: '600', fontSize: 15 },
  linkExcluir: { color: '#999',  fontSize: 15 },
  paginacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  paginaDesabilitada: { color: '#ccc' },
});