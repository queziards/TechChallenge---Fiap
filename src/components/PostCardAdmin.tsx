//card de post usado na área do professor, que além das informações do post traz os botões Editar e Excluir.
import { Feather } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Post } from '@/services/api';

type Props = {
  post: Post;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function PostCardAdmin({ post, onPress, onEdit, onDelete }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <ThemedText style={styles.titulo}>{post.titulo}</ThemedText>
      <ThemedText type="small" numberOfLines={2} style={styles.descricao}>
        {post.descricao}
      </ThemedText>
      <View style={styles.rodape}>
        <ThemedText type="small" style={styles.autor}>
          {post.autor}
        </ThemedText>
        <View style={styles.acoes}>
          <TouchableOpacity onPress={onEdit} hitSlop={8}>
          <ThemedText type="small" style={styles.acaoTexto}>
              Editar
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} hitSlop={8}>
          <ThemedText type="small" style={[styles.acaoTexto, styles.excluirTexto]}>
              Excluir
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: '#e3e3e3', borderRadius: 10, padding: 12, marginBottom: 10,  },
  descricao: { marginTop: 4, marginBottom: 8, fontSize: 16 },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  autor: { color: '#E8174B', fontWeight: '600', fontSize: 16 },
  acoes: { flexDirection: 'row', gap: 14, fontSize: 16 },
  acaoTexto: { fontWeight: '600', opacity: 0.8, fontSize: 17, color:'#E8174B' }, //editar
  excluirTexto: { color: '#999' },
  titulo:{fontSize: 17, fontWeight: '700'}
});