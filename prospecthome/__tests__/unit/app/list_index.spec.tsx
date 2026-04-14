import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ListScreen from '../../../app/(tabs)/list/index';
import { useProspectos } from '../../../hooks/useProspectos';

// Mock useProspectos
jest.mock('../../../hooks/useProspectos', () => ({
  useProspectos: jest.fn()
}));

// Mock ProspectoCard
jest.mock('../../../components/ProspectoCard', () => ({
  ProspectoCard: ({ prospecto, onPress }: any) => <></>
}));

// Mock icons
jest.mock('lucide-react-native', () => ({
  Search: ({ size, color }: any) => <></>,
  RefreshCw: ({ size, color }: any) => <></>,
}));

// Mock safe area
jest.mock('react-native-safe-area-context', () => {
  const View = require('react-native').View;
  return {
    SafeAreaView: (props: any) => <View {...props} />,
    SafeAreaProvider: (props: any) => <View {...props} />,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock router
jest.mock('expo-router', () => ({
  router: { push: jest.fn() }
}));

describe('ListScreen', () => {
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useProspectos as jest.Mock).mockReturnValue({
      prospectos: [
        { id: '1', status: { value: 'novo' }, syncStatus: { isSynced: () => false, isPending: () => true, isError: () => false } }
      ],
      loading: false,
      syncing: false,
      fetch: mockRefresh
    });
  });

  it('deve renderizar o banner de sincronizacao pendente', () => {
    const { getByText } = render(<ListScreen />);
    expect(getByText(/pendentes de sincronização/i)).toBeTruthy();
  });

  it('deve renderizar mensagem vazia quando nao ha prospectos', () => {
    (useProspectos as jest.Mock).mockReturnValue({
      prospectos: [],
      loading: false,
      syncing: false,
      fetch: mockRefresh
    });

    const { getByText } = render(<ListScreen />);
    expect(getByText(/Nenhum prospecto capturado ainda/i)).toBeTruthy();
  });
});
