//FORMULARIOS DE  ALUNOS
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/services/api';

export function FormAluno() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; nome?: string; email?: string }>();
  const editando = !!params.id;

  const [nome, setNome] = useState(params.nome ?? '');
  const [email, setEmail] = useState(params.email ?? '');
  const [senha, setSenha] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!nome.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Preenche o nome e o e-mail.');
      return;
    }
    if (!editando && !senha.trim()) {
      Alert.alert('Atenção', 'Defina uma senha para o novo aluno.');
      return;
    }

    setSalvando(true);
    try {
      if (editando) {
        const payload: Record<string, string> = { name: nome, email };
        if (senha.trim()) payload.password = senha;
        await api.put(`/students/${params.id}`, payload);
      } else {
        await api.post('/auth/register', { name: nome, email, password: senha, role: 'student' });
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Erro ao salvar', e?.response?.data?.message ?? 'Não foi possível salvar o aluno.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.titulo}>
          {editando ? 'Editar aluno' : 'Cadastrar aluno'}
        </ThemedText>

        <ThemedText type="small">Nome</ThemedText>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} />

        <ThemedText type="small">E-mail</ThemedText>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />

        <ThemedText type="small">Senha</ThemedText>
        <TextInput
          style={styles.input}
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
  textoBotao: { color: '#fff' },
});