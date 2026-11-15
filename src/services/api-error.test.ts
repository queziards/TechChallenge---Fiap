import { apiErrorMessage } from './api-error';

function axiosError(status: number, data: unknown = {}) {
  return {
    isAxiosError: true,
    response: { status, data },
  };
}

describe('apiErrorMessage', () => {
  const fallback = 'Falha inesperada.';

  it('returns an authentication message for 401', () => {
    expect(apiErrorMessage(axiosError(401), fallback)).toContain('autenticado');
  });

  it('returns a permission message for 403', () => {
    expect(apiErrorMessage(axiosError(403), fallback)).toContain('permissão');
  });

  it('returns a not-found message for 404', () => {
    expect(apiErrorMessage(axiosError(404), fallback)).toContain('não foi encontrado');
  });

  it('returns validation details for 422', () => {
    expect(
      apiErrorMessage(
        axiosError(422, { errors: { email: ['E-mail inválido'], password: ['Senha curta'] } }),
        fallback
      )
    ).toBe('E-mail inválido\nSenha curta');
  });

  it('uses the server message for other HTTP errors', () => {
    expect(apiErrorMessage(axiosError(500, { message: 'Serviço indisponível' }), fallback))
      .toBe('Serviço indisponível');
  });

  it('uses the fallback for non-Axios errors', () => {
    expect(apiErrorMessage(new Error('Other failure'), fallback)).toBe(fallback);
  });
});
