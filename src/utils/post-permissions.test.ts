import { canManagePost } from './post-permissions';

describe('canManagePost', () => {
  it('allows an admin to manage posts from any author', () => {
    expect(canManagePost('admin', 42, 7)).toBe(true);
  });

  it('allows a teacher to manage their own post', () => {
    expect(canManagePost('teacher', 7, 7)).toBe(true);
  });

  it('does not allow a teacher to manage another teacher post', () => {
    expect(canManagePost('teacher', 42, 7)).toBe(false);
  });

  it('does not allow students to manage posts', () => {
    expect(canManagePost('student', 7, 7)).toBe(false);
  });

  it('does not allow a teacher with no user ID to manage posts', () => {
    expect(canManagePost('teacher', 7, null)).toBe(false);
  });
});
