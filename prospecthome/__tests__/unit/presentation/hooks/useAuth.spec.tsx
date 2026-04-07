import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from "../../../../src/presentation/hooks/useAuth";
import { container } from "../../../../src/di/container";
import { Corretor } from "../../../../src/domain/entities/Corretor";

// Mock container dependencias
jest.mock('../../../../src/di/container', () => ({
  __esModule: true,
  container: {
    authGateway: {
      login: jest.fn(),
      logout: jest.fn()
    },
    sessionRepository: {
      saveSession: jest.fn(),
      getSession: jest.fn(),
      clearSession: jest.fn()
    }
  }
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve carregar a sessao inicial ao montar', async () => {
    const fakeCorretor = Corretor.create({ id: '1', email: 't@t.com' });
    (container.sessionRepository.getSession as jest.Mock).mockResolvedValue({ 
      corretor: fakeCorretor, 
      token: 'tok' 
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    // Initial state
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(fakeCorretor);
  });

  it('deve fazer login com sucesso', async () => {
    const fakeCorretor = Corretor.create({ id: '1', email: 't@t.com' });
    (container.sessionRepository.getSession as jest.Mock).mockResolvedValue(null);
    (container.authGateway.login as jest.Mock).mockResolvedValue({ 
      corretor: fakeCorretor, 
      token: 'tok' 
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.login('t@t.com', 'pass');
    });

    expect(container.authGateway.login).toHaveBeenCalledWith('t@t.com', 'pass');
    expect(result.current.user).toEqual(fakeCorretor);
  });

  it('deve fazer logout e limpar a sessao', async () => {
    const fakeCorretor = Corretor.create({ id: '1', email: 't@t.com' });
    (container.sessionRepository.getSession as jest.Mock).mockResolvedValue({ 
      corretor: fakeCorretor, 
      token: 'tok' 
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.logout();
    });

    expect(container.authGateway.logout).toHaveBeenCalled();
    expect(container.sessionRepository.clearSession).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });
});
