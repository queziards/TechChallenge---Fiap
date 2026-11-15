import type { UserRole } from '@/services/api';

export function canManagePost(
  role: UserRole | null,
  authorId: number | undefined,
  currentUserId: number | null
) {
  if (role === 'admin') return true;
  return role === 'teacher' && currentUserId !== null && authorId === currentUserId;
}
