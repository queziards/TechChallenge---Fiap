//LISTA DE PROFESSORES CADASTRADOS
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfessorNav } from '@/components/ProfessorNav';
import { useToast } from '@/components/ToastProvider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRequireTeacher } from '@/hooks/use-require-teacher';
import api, { PaginatedResponse, PaginationMeta, Professor } from '@/services/api';
import { apiErrorMessage } from '@/services/api-error';

const POR_PAGINA = 20;
const META_INICIAL: PaginationMeta = { currentPage: 1, lastPage: 1, total: 0, perPage: POR_PAGINA };

type UserApi = { id: number; name: string; email: string };

function mapProfessor(u: UserApi): Professor {
  return { id: u.id, nome: u.name, email: u.email };
}

export function ListaProfessores() {
  const router = useRouter();
  const { showToast } = useToast();
  const { checking, authorized, role } = useRequireTeacher();
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [meta, setMeta] = useState(META_INICIAL);

  const buscarProfessores = useCallback(async (page = meta.currentPage) => {
    if (!authorized) return;
    setCarregando(true);
    try {
      const resposta = await api.get<PaginatedResponse<UserApi>>('/teachers', {
        params: { page, perPage: POR_PAGINA },
      });
      setProfessores(resposta.data.data.map(mapProfessor));
      setMeta(resposta.data.meta);
    } catch (e: unknown) {
      Alert.alert('Erro', apiErrorMessage(e, 'Não foi possível carregar os professores.'));
    } finally {
      setCarregando(false);
    }
  }, [authorized, meta.currentPage]);

  useFocusEffect(
    useCallback(() => {
      buscarProfessores(meta.currentPage);
    }, [buscarProfessores, meta.currentPage])
  );

  function editar(professor: Professor) {
    router.push({
      pathname: '/professor/professor-form',
      params: { id: String(professor.id), nome: professor.nome, email: professor.email },
    });
  }

  function excluir(professor: Professor) {
    if (role !== 'admin') {
      Alert.alert('Acesso negado', 'Somente administradores podem excluir professores.');
      return;
    }

    Alert.alert('Excluir professor', `Tem certeza que deseja excluir "${professor.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/teachers/${professor.id}`);
            showToast('Professor excluído com sucesso.', 'success');
            const page = professores.length === 1 ? Math.max(1, meta.currentPage - 1) : meta.currentPage;
            await buscarProfessores(page);
          } catch (e: unknown) {
            showToast(apiErrorMessage(e, 'Não foi possível excluir o professor.'), 'error');
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
          <ThemedText type="title">Professores</ThemedText>
          {role === 'admin' ? (
            <TouchableOpacity style={styles.botaoNovo} onPress={() => router.push('/professor/professor-form')}>
              <ThemedText style={styles.textoBotaoNovo}>+ Novo</ThemedText>
            </TouchableOpacity>
          ) : null}
        </View>

        {carregando ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <>
            <FlatList
              data={professores}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View>
                    <ThemedText type="smallBold">{item.nome}</ThemedText>
                    <ThemedText type="small">{item.email}</ThemedText>
                  </View>
                  <View style={styles.acoes}>
                    {role === 'admin' ? (
                      <>
                        <TouchableOpacity onPress={() => editar(item)}>
                          <ThemedText style={styles.link}>Editar</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => excluir(item)}>
                          <ThemedText style={styles.linkExcluir}>Excluir</ThemedText>
                        </TouchableOpacity>
                      </>
                    ) : null}
                  </View>
                </View>
              )}
              ListEmptyComponent={<ThemedText>Nenhum professor cadastrado.</ThemedText>}
              onRefresh={() => buscarProfessores(meta.currentPage)}
              refreshing={carregando}
            />

            <View style={styles.paginacao}>
              <TouchableOpacity disabled={carregando || meta.currentPage <= 1} onPress={() => buscarProfessores(meta.currentPage - 1)}>
                <ThemedText type="small" style={meta.currentPage <= 1 ? styles.paginaDesabilitada : styles.link}>Anterior</ThemedText>
              </TouchableOpacity>
              <ThemedText type="small">
                Página {meta.currentPage} de {meta.lastPage} · {meta.total === 0 ? 0 : (meta.currentPage - 1) * meta.perPage + 1}
                {'–'}{Math.min(meta.currentPage * meta.perPage, meta.total)} de {meta.total}
              </ThemedText>
              <TouchableOpacity disabled={carregando || meta.currentPage >= meta.lastPage} onPress={() => buscarProfessores(meta.currentPage + 1)}>
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
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,},
  botaoNovo: { backgroundColor: '#E8174B', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  textoBotaoNovo: { color: '#fff', fontSize: 18},
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
  acoes: { flexDirection: 'row', gap: 16, fontSize: 15},
  link: { color: '#E8174B', fontWeight: '600', fontSize: 15 },
  linkExcluir: { color: '#999', fontSize: 15},
  paginacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  paginaDesabilitada: { color: '#ccc' },
});