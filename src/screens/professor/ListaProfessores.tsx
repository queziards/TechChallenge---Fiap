//LISTA DE PROFESSORES CADASTRADOS
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfessorNav } from '@/components/ProfessorNav';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api, { Professor } from '@/services/api';

const POR_PAGINA = 3;

// Formato que a API devolve
type UserApi = { id: number; name: string; email: string };

function mapProfessor(u: UserApi): Professor {
  return { id: u.id, nome: u.name, email: u.email };
}

export function ListaProfessores() {
  const router = useRouter();
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(1);

  const buscarProfessores = useCallback(async () => {
    setCarregando(true);
    try {
      const resposta = await api.get<UserApi[]>('/teachers');
      setProfessores(resposta.data.map(mapProfessor));
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os professores.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarProfessores();
  }, [buscarProfessores]);

  const totalPaginas = Math.max(1, Math.ceil(professores.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const itensDaPagina = professores.slice(inicio, inicio + POR_PAGINA);

  function editar(professor: Professor) {
    router.push({
      pathname: '/professor/professor-form',
      params: { id: String(professor.id), nome: professor.nome, email: professor.email },
    });
  }

  function excluir(professor: Professor) {
    Alert.alert('Excluir professor', `Tem certeza que deseja excluir "${professor.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/teachers/${professor.id}`);
            setProfessores((atual) => atual.filter((p) => p.id !== professor.id));
          } catch (e) {
            Alert.alert('Erro', 'Não foi possível excluir o professor.');
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
          <ThemedText type="title">Professores</ThemedText>
          <TouchableOpacity style={styles.botaoNovo} onPress={() => router.push('/professor/professor-form')}>
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
                      <ThemedText type="small" style={styles.link}>Editar</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => excluir(item)}>
                      <ThemedText type="small" style={styles.linkExcluir}>Excluir</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={<ThemedText>Nenhum professor cadastrado.</ThemedText>}
              onRefresh={buscarProfessores}
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
  textoBotaoNovo: { color: '#fff' },
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
  link: { color: '#E8174B', fontWeight: '600' },
  linkExcluir: { color: '#999' },
  paginacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  paginaDesabilitada: { color: '#ccc' },
});