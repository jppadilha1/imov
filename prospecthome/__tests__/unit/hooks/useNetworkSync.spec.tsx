import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNetworkSync } from '../../../hooks/useNetworkSync';

const mockExecute = jest.fn();
const mockIsConnected = jest.fn();
let capturedListener: ((isConnected: boolean) => void) | null = null;
const mockUnsubscribe = jest.fn();

jest.mock('../../../src/dependency_injection/container', () => ({
  container: {
    syncGateway: {},
    prospectoRepository: {},
    geocodeService: {},
    networkService: {
      isConnected: () => mockIsConnected(),
      addListener: (cb: (isConnected: boolean) => void) => {
        capturedListener = cb;
        return mockUnsubscribe;
      },
    },
  },
}));

jest.mock('../../../src/application/use-cases/SyncProspectosUseCase', () => ({
  SyncProspectosUseCase: jest.fn().mockImplementation(() => ({
    execute: mockExecute,
  })),
}));

describe('useNetworkSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedListener = null;
    mockExecute.mockResolvedValue(undefined);
  });

  it('dispara sync no mount quando já está online', async () => {
    mockIsConnected.mockResolvedValue(true);

    renderHook(() => useNetworkSync());

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });
  });

  it('não dispara sync no mount quando offline', async () => {
    mockIsConnected.mockResolvedValue(false);

    renderHook(() => useNetworkSync());

    await waitFor(() => {
      expect(capturedListener).not.toBeNull();
    });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('dispara sync ao transicionar de offline para online', async () => {
    mockIsConnected.mockResolvedValue(false);

    renderHook(() => useNetworkSync());

    await waitFor(() => expect(capturedListener).not.toBeNull());
    expect(mockExecute).not.toHaveBeenCalled();

    await act(async () => {
      capturedListener!(true);
    });

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });
  });

  it('não dispara sync ao transicionar de online para offline', async () => {
    mockIsConnected.mockResolvedValue(true);

    renderHook(() => useNetworkSync());

    await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(1));

    await act(async () => {
      capturedListener!(false);
    });

    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('ignora notificações duplicadas de online enquanto sync em andamento', async () => {
    mockIsConnected.mockResolvedValue(false);
    let resolveSync: () => void = () => {};
    mockExecute.mockImplementation(
      () => new Promise<void>((resolve) => { resolveSync = resolve; })
    );

    renderHook(() => useNetworkSync());

    await waitFor(() => expect(capturedListener).not.toBeNull());

    await act(async () => {
      capturedListener!(true);
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(1));

    // Second online notification while first sync still in-flight (no offline transition between)
    await act(async () => {
      capturedListener!(true);
    });

    expect(mockExecute).toHaveBeenCalledTimes(1);

    resolveSync();
  });

  it('limpa listener no unmount', async () => {
    mockIsConnected.mockResolvedValue(true);

    const { unmount } = renderHook(() => useNetworkSync());

    await waitFor(() => expect(capturedListener).not.toBeNull());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
