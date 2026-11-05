//LOGIN E CADASTRO DO ALUNO (permite comentar nos posts)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams} from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/services/api';


export function LoginAluno() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; titulo?: string; conteudo?: string; autor?: string }>(); //para o aluno logar
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviar() {
    if (!email.trim() || !senha || (modoCadastro && !nome.trim())) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    setCarregando(true);
    try {
      // POST /api/v1/auth/register (só no modo cadastro)
      if (modoCadastro) {
        await api.post('/auth/register', { name: nome.trim(), email: email.trim(), password: senha });
      }
      // POST /api/v1/auth/login
      const resposta = await api.post('/auth/login', { email: email.trim(), password: senha });
      console.log('RESPOSTA LOGIN:', JSON.stringify(resposta.data)); 
      const token = resposta.data?.data?.token ?? resposta.data?.token ?? resposta.data?.accessToken;
      if (!token) throw new Error('Token não encontrado na resposta');

      await AsyncStorage.setItem('@token', String(token));
      const nomeUsuario = resposta.data?.data?.user?.name;
      if (nomeUsuario) await AsyncStorage.setItem('@nome', nomeUsuario);
       console.log('LOGIN OK | params:', JSON.stringify(params), '| canGoBack:', router.canGoBack());
       
       if (params.id) {
        router.replace({
          pathname: '/post/[id]',
          params: { id: params.id, titulo: params.titulo, conteudo: params.conteudo, autor: params.autor },
        });
      } else {
        router.dismissAll();
      }

    } catch (e: any) {
      console.log('ERRO:', e.response?.status, JSON.stringify(e.response?.data), e.message); 
      const msg = e.response?.data?.message ?? e.message; 
      Alert.alert('Erro', modoCadastro ? 'Não foi possível cadastrar.' : 'E-mail ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{modoCadastro ? 'Criar conta' : 'Entrar'}</ThemedText>

      {modoCadastro && (
        <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
      )}
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />

      <TouchableOpacity style={[styles.botao, carregando && { opacity: 0.6 }]} onPress={enviar} disabled={carregando}>
        <ThemedText style={styles.textoBotao}>
          {carregando ? 'Aguarde...' : modoCadastro ? 'Cadastrar e entrar' : 'Entrar'}
        </ThemedText>
      </TouchableOpacity>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderColor: '#e3e3e3', borderRadius: 8, paddingHorizontal: 12, height: 50, fontSize: 16 },
  botao: { backgroundColor: '#E8174B', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  textoBotao: { color: '#fff', fontSize: 16 },
  link: { color: '#E8174B', fontWeight: '600', textAlign: 'center', marginTop: 4 },
});