//menu de navegação do Portal do Professor, com os links Posts, Professores, Alunos e Sair.
import { Link, usePathname, useRouter } from 'expo-router';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { logoutSession } from '@/services/auth';

const ITENS = [
  { href: '/professor', label: 'Posts' },
  { href: '/professor/professores', label: 'Professores' },
  { href: '/professor/alunos', label: 'Alunos' },
] as const;



export function ProfessorNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    if (saindo) return;
    setSaindo(true);
    try {
      await logoutSession();
      router.replace('/professor/login');
    } catch (error: unknown) {
      Alert.alert('Erro ao sair', error instanceof Error ? error.message : 'Não foi possível encerrar a sessão.');
    } finally {
      setSaindo(false);
    }
  }

  return (
    <View style={styles.container}>
      {ITENS.map((item) => {
        const ativo = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} style={styles.item}>
            <ThemedText
              type={ativo ? 'smallBold' : 'small'}
              style={[styles.itemTexto, ativo ? styles.ativo : undefined]}>
              {item.label}
            </ThemedText>
          </Link>
        );
      })}
      <TouchableOpacity onPress={sair} style={styles.item} disabled={saindo}>
        <ThemedText type="small" style={[styles.itemTexto, styles.sair]}>
          {saindo ? 'Saindo...' : 'Sair'}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
    paddingBottom: 10,
  },
  item: { paddingVertical: 2 },
  itemTexto: { fontSize: 18 },
  ativo: { color: '#E8174B' },
  sair: { color: '#999',  },
});