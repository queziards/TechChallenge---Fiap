import { isAxiosError } from 'axios';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function validationMessage(errors: unknown): string | null {
  if (!isRecord(errors)) return null;

  const messages = Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === 'string');

  return messages.length ? messages.join('\n') : null;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;

  const status = error.response?.status;
  const data: unknown = error.response?.data;
  const message = isRecord(data) && typeof data.message === 'string' ? data.message : null;

  if (status === 401) return 'Sua sessão expirou ou você não está autenticado. Entre novamente.';
  if (status === 403) return 'Você não tem permissão para realizar esta ação.';
  if (status === 404) return 'O recurso solicitado não foi encontrado.';
  if (status === 422) {
    const details = isRecord(data) ? validationMessage(data.errors) : null;
    return details ?? message ?? 'Os dados informados são inválidos.';
  }

  return message ?? fallback;
}
