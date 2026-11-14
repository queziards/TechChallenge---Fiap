//LOGIN E CADASTRO DO ALUNO (permite comentar nos posts)
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useEffect, useRef, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import api from '@/services/api';
import { apiErrorMessage } from '@/services/api-error';
import { saveSession } from '@/services/auth';

type LoginResponse = {
  data?: {
    token?: string;
    user?: { id?: number; role?: string; name?: string };
  };
};

export function LoginAluno() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const theme = useTheme();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const senhaEmFoco = useRef(false);
  const params = useLocalSearchParams<{
    id?: string;
    titulo?: string;
    conteudo?: string;
    autor?: string;
    autorId?: string;
  }>();
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', () => {
      if (senhaEmFoco.current) {
        scrollRef.current?.scrollToEnd({ animated: true });
      }
    });

    return () => subscription.remove();
  }, []);

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
      const resposta = await api.post<LoginResponse>('/auth/login', { email: email.trim(), password: senha });
      const { token, user } = resposta.data.data ?? {};
      if (!token || user?.role !== 'student') {
        Alert.alert('Acesso negado', 'Esta área é exclusiva para alunos.');
        return;
      }

      await saveSession(token, 'student', typeof user.id === 'number' ? user.id : null, user.name);
       
       if (params.id) {
        router.replace({
          pathname: '/post/[id]',
          params: {
            id: params.id,
            titulo: params.titulo,
            conteudo: params.conteudo,
            autor: params.autor,
            autorId: params.autorId,
          },
        });
      } else {
        router.dismissAll();
      }

    } catch (e: unknown) {
      Alert.alert(
        'Erro',
        apiErrorMessage(e, modoCadastro ? 'Não foi possível cadastrar o aluno.' : 'Não foi possível entrar.')
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' || Platform.OS === 'android' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
        enabled={Platform.OS !== 'web'}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="title">{modoCadastro ? 'Criar conta' : 'Entrar'}</ThemedText>

          {modoCadastro && (
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
              placeholderTextColor={theme.textSecondary}
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
              returnKeyType="next"
            />
          )}
          <TextInput
            style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
            placeholderTextColor={theme.textSecondary}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
          />
          <View style={[styles.passwordContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
            <TextInput
              style={[styles.passwordInput, { color: theme.text }]}
              placeholderTextColor={theme.textSecondary}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              returnKeyType="done"
              onFocus={() => {
                senhaEmFoco.current = true;
              }}
              onBlur={() => {
                senhaEmFoco.current = false;
              }}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setMostrarSenha((visivel) => !visivel)}
              accessibilityRole="button"
              accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              hitSlop={8}
            >
              <Ionicons
                name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.botao, carregando && { opacity: 0.6 }]} onPress={enviar} disabled={carregando}>
            <ThemedText style={styles.textoBotao}>
              {carregando ? 'Aguarde...' : modoCadastro ? 'Cadastrar e entrar' : 'Entrar'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModoCadastro((atual) => !atual)} disabled={carregando}>
            <ThemedText style={styles.link}>
              {modoCadastro ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastre-se'}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoiding: { flex: 1 },
  content: { flexGrow: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderColor: '#e3e3e3', borderRadius: 8, paddingHorizontal: 12, height: 50, fontSize: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, height: 50 },
  passwordInput: { flex: 1, height: '100%', paddingHorizontal: 12, fontSize: 16 },
  passwordToggle: { height: '100%', minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  botao: { backgroundColor: '#E8174B', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  textoBotao: { color: '#fff', fontSize: 16 },
  link: { color: '#E8174B', fontWeight: '600', textAlign: 'center', marginTop: 4 },
});