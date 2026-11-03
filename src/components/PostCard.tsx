//card que exibe um post (título, descrição e autor) na lista que o aluno vê, só para leitura.
import { ThemedText } from '@/components/themed-text';
import { Post } from '@/services/api';
import { StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  post: Post;
  onPress: () => void;
};

export function PostCard({ post, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <ThemedText style={styles.titulo}>{post.titulo}</ThemedText>
      <ThemedText numberOfLines={2} style={styles.descricao}>
        {post.descricao}
      </ThemedText>
      <ThemedText  style={styles.autor}>
        {post.autor}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  descricao: {
    marginTop: 4,
    marginBottom: 6,
  },
  autor: {
    color: '#E8174B',
    fontWeight: '600',
  },
titulo:{
  fontSize: 19
}

});