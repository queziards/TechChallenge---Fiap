import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import api from '@/services/api';

export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    setCarregando(true);
    try {
      const resposta = await api.post('/auth/login', { email, password: senha });
      const token = resposta.data.data.token;

      await AsyncStorage.setItem('@token', token);
      router.replace('/professor');
    } catch (erro: any) {
      Alert.alert(
        'Erro ao entrar',
        erro?.response?.data?.message ?? 'E-mail ou senha incorretos.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.titulo}>
          Portal do Professor
        </ThemedText>
        <ThemedText style={styles.subtitulo}>
          Faça login para continuar
        </ThemedText>

        <ThemedText style={styles.intro}>Login</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="professor@escola.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <ThemedText  style={styles.intro}>Senha</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Sua senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity style={styles.botao} onPress={entrar} disabled={carregando}>
          <ThemedText  style={styles.textoBotao}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

 //portal do professor e bloco todo
  safeArea: { 
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
  
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
  
  //login e senha - titulo
  intro:{
    fontSize:19
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
});