//Tela de Login professor e aluno s

import { useRouter } from 'expo-router';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import api from '@/services/api';
import { apiErrorMessage } from '@/services/api-error';
import { saveSession } from '@/services/auth';

type LoginResponse = {
  data?: {
    token?: string;
    user?: { id?: number; role?: string };
  };
};

export function Login() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const theme = useTheme();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const senhaEmFoco = useRef(false);
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

  async function entrar() {
    setCarregando(true);
    try {
      const resposta = await api.post<LoginResponse>('/auth/login', { email, password: senha });
      const { token, user } = resposta.data.data ?? {};

      if (!token || !user || (user.role !== 'teacher' && user.role !== 'admin')) {
        Alert.alert('Acesso negado', 'Esta área é exclusiva para professores e administradores.');
        return;
      }

      await saveSession(token, user.role, typeof user.id === 'number' ? user.id : null);
      router.replace('/professor');
    } catch (erro: unknown) {
      Alert.alert(
        'Erro ao entrar',
        apiErrorMessage(erro, 'Não foi possível entrar. Verifique o e-mail e a senha.')
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
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity onPress={() => router.push('/alunos/login-aluno')}>
              <ThemedText style={styles.linkAlunoTexto}>Sou aluno</ThemedText>
            </TouchableOpacity>

            <ThemedText type="title" style={styles.titulo}>
              Portal do Professor
            </ThemedText>
            <ThemedText style={styles.subtitulo}>
              Faça login para continuar
            </ThemedText>

            <ThemedText style={styles.intro}>Login</ThemedText>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}
              placeholderTextColor={theme.textSecondary}
              placeholder="professor@escola.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              returnKeyType="next"
            />

            <ThemedText style={styles.intro}>Senha</ThemedText>
            <View style={[styles.passwordContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
              <TextInput
                style={[styles.passwordInput, { color: theme.text }]}
                placeholderTextColor={theme.textSecondary}
                placeholder="Sua senha"
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

            <TouchableOpacity style={styles.botao} onPress={entrar} disabled={carregando}>
              <ThemedText style={styles.textoBotao}>
                {carregando ? 'Entrando...' : 'Entrar'}
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoiding: { flex: 1 },

  //portal do professor e bloco todo
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
  content: { flexGrow: 1, paddingBottom: 24 },

  titulo: {
    textAlign: 'center',
    marginBottom: 4,

  },

  //faca seu login
  subtitulo: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.6,
    fontSize: 18
  },


  input: {
    height: 60,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 16,
    fontSize: 16,
  },
  passwordContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  passwordInput: { flex: 1, height: '100%', paddingHorizontal: 12, fontSize: 16 },
  passwordToggle: { height: '100%', minWidth: 48, alignItems: 'center', justifyContent: 'center' },

  //login e senha - titulo
  intro: {
    fontSize: 19
  },


  botao: {
    backgroundColor: '#E8174B',
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,

  },

  textoBotao: {
    color: '#fff',
    fontSize: 20,
  },
  texto: { color: '#fff', fontSize: 18 },

  linkAlunoTexto: {
    color: '#E8174B',          
    fontSize: 20,              
    fontWeight: '600',
    textDecorationLine: 'underline',  // sublinhado
  },
});