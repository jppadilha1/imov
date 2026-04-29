import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSync } from '../../../hooks/useSync';

const mockExecute = jest.fn();
const mockIsConnected = jest.fn();
let capturedListener: ((isConnected: boolean) => void) | null = null;
const mockUnsubscribe = jest.fn();

jest.mock('../../../src/dependency_injection/container', () => ({
  container: {
    syncGateway: {},
    prospectoRepository: {},
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

describe('useSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedListener = null;
    mockExecute.mockResolvedValue(undefined);
  });

  it('dispara sync na montagem quando já está online', async () => {
    mockIsConnected.mockResolvedValue(true);

    renderHook(() => useSync());

    await waitFor(() => expect(mockExecute).toHaveBeenCalledTimes(1));
  });

  it('não dispara sync na montagem quando offline', async () => {
    mockIsConnected.mockResolvedValue(false);

    renderHook(() => useSync());

    await waitFor(() => expect(mockIsConnected).toHaveBeenCalled());
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('dispara sync quando addListener notifica isConnected = true', async () => {
    mockIsConnected.mockResolvedValue(false);

    renderHook(() => useSync());

    await waitFor(() => expect(capturedListener).not.toBeNull());

    await act(async () => {
      capturedListener?.(true);
    });

    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('não dispara sync quando addListener notifica isConnected = false', async () => {
    mockIsConnected.mockResolvedValue(false);

    renderHook(() => useSync());

    await waitFor(() => expect(capturedListener).not.toBeNull());

    await act(async () => {
      capturedListener?.(false);
    });

    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('chama unsubscribe no unmount', async () => {
    mockIsConnected.mockResolvedValue(false);

    const { unmount } = renderHook(() => useSync());

    await waitFor(() => expect(capturedListener).not.toBeNull());

    act(() => { unmount(); });

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
