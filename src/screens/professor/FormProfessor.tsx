//FORMULARIO PROFESSOR
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/ToastProvider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import api from '@/services/api';
import { apiErrorMessage } from '@/services/api-error';
import { useRequireTeacher } from '@/hooks/use-require-teacher';

export function FormProfessor() {
  const router = useRouter();
  const { showToast } = useToast();
  const theme = useTheme();
  const { checking, authorized, role } = useRequireTeacher();
  const params = useLocalSearchParams<{ id?: string; nome?: string; email?: string }>();
  const editando = !!params.id;

  const [nome, setNome] = useState(params.nome ?? '');
  const [email, setEmail] = useState(params.email ?? '');
  const [senha, setSenha] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!checking && authorized && role !== 'admin') {
      Alert.alert(
        'Acesso negado',
        editando
          ? 'Somente administradores podem editar professores.'
          : 'Somente administradores podem cadastrar professores.'
      );
      router.back();
    }
  }, [authorized, checking, editando, role, router]);

  async function salvar() {
    if (!authorized) return;
    if (role !== 'admin') {
      Alert.alert(
        'Acesso negado',
        editando
          ? 'Somente administradores podem editar professores.'
          : 'Somente administradores podem cadastrar professores.'
      );
      return;
    }
    if (!nome.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Preenche o nome e o e-mail.');
      return;
    }
    if (!editando && !senha.trim()) {
      Alert.alert('Atenção', 'Defina uma senha para o novo professor.');
      return;
    }

    setSalvando(true);
    try {
      if (editando) {
        const payload: Record<string, string> = { name: nome.trim(), email: email.trim() };
        if (senha.trim()) payload.password = senha.trim();
        await api.put(`/teachers/${params.id}`, payload);
      } else {
        await api.post('/teachers', { name: nome.trim(), email: email.trim(), password: senha });
      }
      if (editando) showToast('Professor atualizado com sucesso.', 'success');
      router.back();
    } catch (e: unknown) {
      if (editando) {
        showToast(apiErrorMessage(e, 'Não foi possível atualizar o professor.'), 'error');
      } else {
        Alert.alert('Erro ao salvar', apiErrorMessage(e, 'Não foi possível salvar o professor.'));
      }
    } finally {
      setSalvando(false);
    }
  }

  if (checking || !authorized || role !== 'admin') {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.titulo}>
          {editando ? 'Editar professor' : 'Cadastrar professor'}
        </ThemedText>

        <ThemedText type="small">Nome</ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
          placeholderTextColor={theme.textSecondary}
          value={nome}
          onChangeText={setNome}
        />

        <ThemedText type="small">E-mail</ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <ThemedText type="small">Senha</ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
          placeholderTextColor={theme.textSecondary}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          placeholder={editando ? 'Deixe em branco para manter a atual' : ''}
        />

        <TouchableOpacity style={styles.botao} onPress={salvar} disabled={salvando}>
          <ThemedText type="smallBold" style={styles.textoBotao}>
            {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar'}
          </ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 16 },
  titulo: { marginBottom: 16 },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  botao: {
    backgroundColor: '#E8174B',
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  textoBotao: { color: '#fff', },
});