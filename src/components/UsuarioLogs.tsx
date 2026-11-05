//usuario aluno logado
//BARRA QUE MOSTRA SE O ALUNO ESTÁ LOGADO (nome + Sair) OU O BOTÃO ENTRAR
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export function UsuarioLogs() {
  const router = useRouter();
  const [logado, setLogado] = useState(false);
  const [nome, setNome] = useState<string | null>(null);

  // Relê o login toda vez que a tela volta a aparecer (ex.: depois de entrar)
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.multiGet(['@token', '@nome']).then(([[, token], [, n]]) => {
        setLogado(!!token);
        setNome(n);
      });
    }, [])
  );

  async function sair() {
    await AsyncStorage.multiRemove(['@token', '@nome']);
    setLogado(false);
    setNome(null);
  }

  return (
    <View style={styles.logs}>
      {logado ? (
        <>
          <ThemedText type="small">Olá, {nome ?? 'aluno'}</ThemedText>
          <TouchableOpacity onPress={sair}>
            <ThemedText type="small" style={styles.link}>Sair</ThemedText>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <ThemedText type="small">Você não está logado</ThemedText>
          <TouchableOpacity onPress={() => router.push('/alunos/login-aluno')}>
            <ThemedText type="small" style={styles.link}>Entrar</ThemedText>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  link: { color: '#E8174B', fontWeight: '600' },
});