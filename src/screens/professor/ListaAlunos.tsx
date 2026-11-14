//LISTA DE ALUNOS CADASTRADOS
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfessorNav } from '@/components/ProfessorNav';
import { useToast } from '@/components/ToastProvider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRequireTeacher } from '@/hooks/use-require-teacher';
import api, { Aluno, PaginatedResponse, PaginationMeta } from '@/services/api';
import { apiErrorMessage } from '@/services/api-error';

const POR_PAGINA = 20;
const META_INICIAL: PaginationMeta = { currentPage: 1, lastPage: 1, total: 0, perPage: POR_PAGINA };

type UserApi = { id: number; name: string; email: string };

function mapAluno(u: UserApi): Aluno {
  return { id: u.id, nome: u.name, email: u.email };
}

export function ListaAlunos() {
  const router = useRouter();
  const { showToast } = useToast();
  const { checking, authorized } = useRequireTeacher();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [meta, setMeta] = useState(META_INICIAL);

  const buscarAlunos = useCallback(async (page = meta.currentPage) => {
    if (!authorized) return;
    setCarregando(true);
    try {
      const resposta = await api.get<PaginatedResponse<UserApi>>('/students', {
        params: { page, perPage: POR_PAGINA },
      });
      setAlunos(resposta.data.data.map(mapAluno));
      setMeta(resposta.data.meta);
    } catch (e: unknown) {
      Alert.alert('Erro', apiErrorMessage(e, 'Não foi possível carregar os alunos.'));
    } finally {
      setCarregando(false);
    }
  }, [authorized, meta.currentPage]);

  useFocusEffect(
    useCallback(() => {
      buscarAlunos(meta.currentPage);
    }, [buscarAlunos, meta.currentPage])
  );

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
            showToast('Aluno excluído com sucesso.', 'success');
            const page = alunos.length === 1 ? Math.max(1, meta.currentPage - 1) : meta.currentPage;
            await buscarAlunos(page);
          } catch (e: unknown) {
            showToast(apiErrorMessage(e, 'Não foi possível excluir o aluno.'), 'error');
          }
        },
      },
    ]);
  }

  if (checking || !authorized) return <ActivityIndicator style={{ flex: 1 }} />;

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
              data={alunos}
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
              onRefresh={() => buscarAlunos(meta.currentPage)}
              refreshing={carregando}
            />

            <View style={styles.paginacao}>
              <TouchableOpacity disabled={carregando || meta.currentPage <= 1} onPress={() => buscarAlunos(meta.currentPage - 1)}>
                <ThemedText type="small" style={meta.currentPage <= 1 ? styles.paginaDesabilitada : styles.link}>Anterior</ThemedText>
              </TouchableOpacity>
              <ThemedText type="small">
                Página {meta.currentPage} de {meta.lastPage} · {meta.total === 0 ? 0 : (meta.currentPage - 1) * meta.perPage + 1}
                {'–'}{Math.min(meta.currentPage * meta.perPage, meta.total)} de {meta.total}
              </ThemedText>
              <TouchableOpacity disabled={carregando || meta.currentPage >= meta.lastPage} onPress={() => buscarAlunos(meta.currentPage + 1)}>
                <ThemedText type="small" style={meta.currentPage >= meta.lastPage ? styles.paginaDesabilitada : styles.link}>Próxima</ThemedText>
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